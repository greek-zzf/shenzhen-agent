import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
  buildIntakeUserPrompt,
  INTAKE_GEMINI_SCHEMA,
  INTAKE_MAX_MESSAGE_CHARS,
  INTAKE_SYSTEM_PROMPT,
  parseIntakeFillLenient,
  sanitizeIntakeMessage,
  type IntakeFill,
} from './intake-fill';

const fillInputSchema = z.object({
  message: z.string().trim().min(1).max(INTAKE_MAX_MESSAGE_CHARS),
});

export type IntakeAssistStatus = {
  available: boolean;
};

export type FillIntakeProfileResult =
  | { available: false }
  | { available: true; fill: IntakeFill };

async function requireIntakeSession() {
  const { getRequest } = await import('@tanstack/react-start/server');
  const request = getRequest();
  const { getAuth } = await import('@/core/auth');
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return { request, userId: session.user.id as string };
}

async function geminiKey(): Promise<string> {
  const { getAllConfigs } = await import('@/modules/config/service');
  const configs = await getAllConfigs();
  return (configs.gemini_api_key || '').trim();
}

/**
 * Whether live assist can call Gemini. Safe to import from the intake route.
 * The API key never leaves the server.
 */
export const getIntakeAssistStatusFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<IntakeAssistStatus> => {
    try {
      const key = await geminiKey();
      return { available: Boolean(key) };
    } catch {
      return { available: false };
    }
  }
);

/**
 * Fill the intake profile schema only. Playbook attach stays in attach.ts.
 */
export const fillIntakeProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => fillInputSchema.parse(raw))
  .handler(async ({ data }): Promise<FillIntakeProfileResult> => {
    const { request } = await requireIntakeSession();

    const { enforceMinIntervalRateLimit } = await import('@/lib/rate-limit');
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 2000,
      keyPrefix: 'intake-fill',
    });
    if (limited) {
      throw new Error('Please wait a moment, then try again.');
    }

    const apiKey = await geminiKey();
    if (!apiKey) {
      return { available: false };
    }

    const { generateStructuredJson } = await import('@/core/ai/gemini');
    const todayUtc = new Date().toISOString().slice(0, 10);
    try {
      const raw = await generateStructuredJson({
        apiKey,
        system: INTAKE_SYSTEM_PROMPT,
        user: buildIntakeUserPrompt(sanitizeIntakeMessage(data.message), todayUtc),
        responseSchema: INTAKE_GEMINI_SCHEMA as unknown as Record<string, unknown>,
        temperature: 0.1,
      });
      return { available: true, fill: parseIntakeFillLenient(raw) };
    } catch (err) {
      console.error('[intake-fill]', err instanceof Error ? err.message : err);
      throw new Error('Could not read that sentence.');
    }
  });
