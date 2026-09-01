import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import type { PlaybookFreshness } from './freshness';

const inputSchema = z.object({
  playbookId: z.string().regex(/^pb-\d{2}$/),
  currentStepId: z.string().min(1).optional(),
});

/**
 * Server-only freshness check. Call from playbook loaders.
 * URLs come from the YAML catalog — never from the client.
 */
export const getPlaybookFreshnessFn = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => inputSchema.parse(raw))
  .handler(async ({ data }): Promise<PlaybookFreshness> => {
    try {
      const { refreshPlaybookSources } = await import('./freshness-fetch');
      return await refreshPlaybookSources(data);
    } catch {
      return { playbookId: data.playbookId, fetched: [], skipped: [] };
    }
  });
