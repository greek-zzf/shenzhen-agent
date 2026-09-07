import {
  fetchOfficialHtml,
  NIA_FAQ_URL,
  NIA_INSTRUCTIONS_URL,
  type FetchOfficialHtmlDeps,
  type OfficialHtmlResult,
} from './official-html';

export const NIA_FAQ_LABEL = 'NIA English FAQ — visa on arrival';
export const NIA_INSTRUCTIONS_LABEL = 'NIA English Instructions';

const ORDINARY_PASSPORT = /ordinary passports?/i;
const URGENT_NEED =
  /urgent needs? to enter|enter China urgently|other urgent needs|urgent need to travel/i;

/**
 * Signals that the page may publish a nationality roster. If any match, we
 * refuse to summarize eligibility and never copy country names.
 */
const ROSTER_HINT =
  /eligible (?:countries|nationalit)|following countries|nationals of the following|nationality (?:list|roster|table)|countries eligible/i;

export const NIA_GROUNDED_SUMMARY =
  'NIA English copy frames a port visa as an ordinary passport plus an urgent need to enter. These pages do not publish a nationality roster. Confirm on the official page the same day — this playbook does not store a country list.';

export type NiaPageStatus = {
  url: string;
  label: string;
  status: 'ok' | 'fail';
  fetched_at: string | null;
};

export type NiaEligibility = {
  pages: NiaPageStatus[];
  mode: 'grounded' | 'link_only';
  summary: string | null;
  fetched_at: string | null;
};

export function detectNationalityRoster(text: string): boolean {
  return ROSTER_HINT.test(text);
}

export function canGroundNiaEligibility(text: string): boolean {
  if (!text.trim()) return false;
  if (detectNationalityRoster(text)) return false;
  return ORDINARY_PASSPORT.test(text) && URGENT_NEED.test(text);
}

export function summarizeNiaEligibility(pages: OfficialHtmlResult[]): NiaEligibility {
  const labeled = pages.map((page) => ({
    url: page.url,
    label: page.url.includes('c156102') ? NIA_FAQ_LABEL : NIA_INSTRUCTIONS_LABEL,
    status: page.status,
    fetched_at: page.fetched_at,
    text: page.text,
  }));

  const statuses: NiaPageStatus[] = labeled.map(({ url, label, status, fetched_at }) => ({
    url,
    label,
    status,
    fetched_at,
  }));

  const okTexts = labeled
    .filter((page) => page.status === 'ok' && page.text)
    .map((page) => page.text as string);
  const combined = okTexts.join('\n\n');
  const fetchedAt =
    labeled.find((page) => page.fetched_at)?.fetched_at ?? null;

  if (!okTexts.length) {
    return {
      pages: statuses,
      mode: 'link_only',
      summary: null,
      fetched_at: null,
    };
  }

  if (canGroundNiaEligibility(combined)) {
    return {
      pages: statuses,
      mode: 'grounded',
      summary: NIA_GROUNDED_SUMMARY,
      fetched_at: fetchedAt,
    };
  }

  return {
    pages: statuses,
    mode: 'link_only',
    summary: null,
    fetched_at: fetchedAt,
  };
}

export async function fetchNiaEligibility(
  deps: FetchOfficialHtmlDeps = {}
): Promise<NiaEligibility> {
  const pages = await Promise.all([
    fetchOfficialHtml(NIA_FAQ_URL, deps),
    fetchOfficialHtml(NIA_INSTRUCTIONS_URL, deps),
  ]);
  return summarizeNiaEligibility(pages);
}
