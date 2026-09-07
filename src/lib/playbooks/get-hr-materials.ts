import { createServerFn } from '@tanstack/react-start';

import type { HrMaterialsExcerpt } from './hr-materials';

/**
 * Live excerpt of named items on the official English work-permit materials
 * page. URLs are hardcoded — never from the client.
 */
export const getHrMaterialsExcerptFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HrMaterialsExcerpt> => {
    try {
      const { fetchHrMaterialsExcerpt } = await import('./hr-materials');
      return await fetchHrMaterialsExcerpt();
    } catch {
      const { HR_MATERIALS_URL } = await import('./official-html');
      return {
        url: HR_MATERIALS_URL,
        status: 'stale',
        fetched_at: null,
        items: [],
      };
    }
  }
);
