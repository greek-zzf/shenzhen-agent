import {
  fetchOfficialHtml,
  HR_MATERIALS_URL,
  type FetchOfficialHtmlDeps,
} from './official-html';

/**
 * Named document items we are allowed to quote if they appear on the official
 * English work-permit / residence materials page. Do not infer that a lease
 * is or is not required — "lease" is not on this list.
 */
export const HR_MATERIAL_ALLOWLIST = [
  'Registration Form of Temporary Residence',
  'Application Form for Foreigner\'s Work Permit',
  'Employment contract',
  'Certificate of no criminal record',
  'Health check certificate',
  "Applicant's passport",
  "Foreigner's Work Permit",
  'Residence permit',
] as const;

export type HrMaterialsExcerpt = {
  url: string;
  status: 'ok' | 'stale' | 'missing';
  fetched_at: string | null;
  items: string[];
};

export function extractAllowlistedMaterials(text: string): string[] {
  const haystack = text.replace(/\s+/g, ' ');
  const found: string[] = [];
  for (const item of HR_MATERIAL_ALLOWLIST) {
    if (includesIgnoreCase(haystack, item)) {
      found.push(item);
    }
  }
  return found;
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function excerptFromOfficialText(params: {
  url: string;
  text: string | null;
  fetched_at: string | null;
  status: 'ok' | 'fail';
}): HrMaterialsExcerpt {
  if (params.status !== 'ok' || !params.text || !params.fetched_at) {
    return {
      url: params.url,
      status: 'stale',
      fetched_at: null,
      items: [],
    };
  }

  const items = extractAllowlistedMaterials(params.text);
  if (!items.length) {
    return {
      url: params.url,
      status: 'missing',
      fetched_at: params.fetched_at,
      items: [],
    };
  }

  return {
    url: params.url,
    status: 'ok',
    fetched_at: params.fetched_at,
    items,
  };
}

export async function fetchHrMaterialsExcerpt(
  deps: FetchOfficialHtmlDeps = {}
): Promise<HrMaterialsExcerpt> {
  const page = await fetchOfficialHtml(HR_MATERIALS_URL, deps);
  return excerptFromOfficialText({
    url: HR_MATERIALS_URL,
    text: page.text,
    fetched_at: page.fetched_at,
    status: page.status,
  });
}
