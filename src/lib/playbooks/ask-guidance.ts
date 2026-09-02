import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
  answerGuidanceQuestion,
  GUIDANCE_MAX_MESSAGE_CHARS,
  sanitizeGuidanceMessage,
  type GuidanceAnswer,
} from './guidance';
import {
  BROKEN_OPTIONS,
  DISTRICTS,
  LOCATIONS,
  PAY_STATES,
  STAY_TYPES,
  VISA_TYPES,
  YES_NO_UNKNOWN,
  type CopilotProfile,
} from './profile';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal('')]);

const profileInputSchema = z.object({
  passport_country: z.string().max(80).default(''),
  visa_type: optionalEnum(VISA_TYPES).default(''),
  location: optionalEnum(LOCATIONS).default(''),
  stay_type: optionalEnum(STAY_TYPES).default(''),
  district: optionalEnum(DISTRICTS).default(''),
  broken: z.array(z.enum(BROKEN_OPTIONS)).max(BROKEN_OPTIONS.length).default([]),
  flags: z.array(z.string().max(40)).max(20).default([]),
  arrival_at: z.string().max(40).nullable().default(null),
  wechat_pay: optionalEnum(PAY_STATES).default(''),
  alipay: optionalEnum(PAY_STATES).default(''),
  has_cn_phone: optionalEnum(YES_NO_UNKNOWN).default(''),
  has_cn_bank: optionalEnum(YES_NO_UNKNOWN).default(''),
});

const askInputSchema = z.object({
  playbookId: z.string().regex(/^pb-\d{2}$/),
  currentStepId: z.string().min(1).max(80).optional(),
  message: z.string().trim().min(1).max(GUIDANCE_MAX_MESSAGE_CHARS),
  profile: profileInputSchema,
});

export type GuidanceAssistStatus = {
  available: boolean;
};

export type AskPlaybookGuidanceResult =
  | { available: false }
  | { available: true; answer: GuidanceAnswer };

async function requireCopilotSession() {
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
 * Whether the run-page helper can call Gemini. Safe to import from the run route.
 * The API key never leaves the server.
 */
export const getGuidanceAssistStatusFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GuidanceAssistStatus> => {
    try {
      const key = await geminiKey();
      return { available: Boolean(key) };
    } catch {
      return { available: false };
    }
  }
);

function toProfile(raw: z.infer<typeof profileInputSchema>): CopilotProfile {
  return {
    passport_country: raw.passport_country,
    visa_type: raw.visa_type,
    location: raw.location,
    stay_type: raw.stay_type,
    district: raw.district,
    broken: raw.broken,
    flags: raw.flags,
    arrival_at: raw.arrival_at,
    wechat_pay: raw.wechat_pay,
    alipay: raw.alipay,
    has_cn_phone: raw.has_cn_phone,
    has_cn_bank: raw.has_cn_bank,
  };
}

/**
 * Grounded help for the current playbook step. YAML and freshness load on the
 * server — the client only sends the question, profile chips, and step id.
 */
export const askPlaybookGuidanceFn = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => askInputSchema.parse(raw))
  .handler(async ({ data }): Promise<AskPlaybookGuidanceResult> => {
    const { request } = await requireCopilotSession();

    const { enforceMinIntervalRateLimit } = await import('@/lib/rate-limit');
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 2000,
      keyPrefix: 'playbook-guidance',
    });
    if (limited) {
      throw new Error('Please wait a moment, then try again.');
    }

    const { getPlaybook, PLAYBOOKS } = await import('./catalog');
    const playbook = getPlaybook(data.playbookId);
    if (!playbook) {
      throw new Error('Unknown playbook.');
    }

    const currentStepId =
      playbook.steps.find((step) => step.id === data.currentStepId)?.id ??
      playbook.steps[0]?.id;

    const { refreshPlaybookSources } = await import('./freshness-fetch');
    const freshness = await refreshPlaybookSources({
      playbookId: playbook.id,
      currentStepId,
    });

    const { buildGuidancePack } = await import('./guidance');
    const pack = buildGuidancePack({
      playbook,
      profile: toProfile(data.profile),
      freshness,
      currentStepId,
      catalog: PLAYBOOKS,
    });

    const { detectHardRefuse, cannedRefuse } = await import('./guidance');
    const hard = detectHardRefuse(data.message, pack);
    if (hard) {
      return { available: true, answer: cannedRefuse(pack, hard) };
    }

    const apiKey = await geminiKey();
    if (!apiKey) {
      return { available: false };
    }

    const { generateStructuredJson } = await import('@/core/ai/gemini');
    try {
      const answer = await answerGuidanceQuestion({
        pack,
        message: sanitizeGuidanceMessage(data.message),
        generate: (options) =>
          generateStructuredJson({
            apiKey,
            system: options.system,
            user: options.user,
            responseSchema: options.responseSchema,
            temperature: options.temperature,
          }),
      });
      return { available: true, answer };
    } catch (err) {
      console.error('[playbook-guidance]', err instanceof Error ? err.message : err);
      throw new Error('Could not answer from this playbook.');
    }
  });
