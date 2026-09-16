import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { answerAgentQuestion, sanitizeAgentMessage } from '@/lib/agent-corpus';
import { AGENT_MAX_MESSAGE_CHARS } from '@/lib/agent-corpus/types';
import { getViteCorpus } from '@/lib/agent-corpus/load-vite';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const bodySchema = z.object({
  message: z.string().trim().min(1).max(AGENT_MAX_MESSAGE_CHARS),
});

async function geminiKey(): Promise<string> {
  const { getAllConfigs } = await import('@/modules/config/service');
  const configs = await getAllConfigs();
  return (configs.gemini_api_key || '').trim();
}

async function GET() {
  try {
    const key = await geminiKey();
    return respData({ available: Boolean(key) });
  } catch {
    return respData({ available: false });
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 2000,
      keyPrefix: 'agent-chat',
    });
    if (limited) {
      return respErr('Please wait a moment, then try again.');
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return respErr('Ask a short question about a Shenzhen errand.');
    }

    const message = sanitizeAgentMessage(parsed.data.message);
    const corpus = getViteCorpus();

    const apiKey = await geminiKey();
    if (!apiKey) {
      const answer = await answerAgentQuestion({ corpus, message });
      return respData(answer);
    }

    const { generateStructuredJson } = await import('@/core/ai/gemini');
    try {
      const answer = await answerAgentQuestion({
        corpus,
        message,
        generate: (options) =>
          generateStructuredJson({
            apiKey,
            system: options.system,
            user: options.user,
            responseSchema: options.responseSchema,
            temperature: options.temperature,
          }),
      });
      return respData(answer);
    } catch (err) {
      console.error('[agent-chat]', err instanceof Error ? err.message : err);
      const fallback = await answerAgentQuestion({ corpus, message });
      return respData(fallback);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not answer.';
    return respErr(message);
  }
}

export const Route = createFileRoute('/api/agent-chat')({
  server: { handlers: { GET, POST } },
});
