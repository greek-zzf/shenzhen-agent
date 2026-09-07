import { createServerFn } from '@tanstack/react-start';

import type { NiaEligibility } from './nia-eligibility';

const EMPTY: NiaEligibility = {
  pages: [
    {
      url: 'https://en.nia.gov.cn/n147418/n147463/c156102/content.html',
      label: 'NIA English FAQ — visa on arrival',
      status: 'fail',
      fetched_at: null,
    },
    {
      url: 'https://en.nia.gov.cn/n147423/n147478/n147715/c158232/content.html',
      label: 'NIA English Instructions',
      status: 'fail',
      fetched_at: null,
    },
  ],
  mode: 'link_only',
  summary: null,
  fetched_at: null,
};

/**
 * Live NIA EN FAQ / Instructions fetch. Never invents a nationality matrix.
 */
export const getNiaEligibilityFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<NiaEligibility> => {
    try {
      const { fetchNiaEligibility } = await import('./nia-eligibility');
      return await fetchNiaEligibility();
    } catch {
      return EMPTY;
    }
  }
);
