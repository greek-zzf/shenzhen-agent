import type { UrlKind } from './schema';

export const SOURCE_FETCH_USER_AGENT =
  'ShenzhenCopilot/0.1 (+https://github.com/greek-zzf/shenzhen-agent)';
export const SOURCE_FETCH_TIMEOUT_MS = 8_000;
export const SOURCE_FETCH_MAX_URLS = 3;
export const SOURCE_FETCH_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
export const NON_LEGAL_SOURCE_LABEL = '非法律来源';

export type UrlFetchStatus = 'ok' | 'fail';
export type UrlFetchError = 'timeout' | 'http' | 'network' | 'unsupported';

export type UrlFreshness = {
  url: string;
  status: UrlFetchStatus;
  httpStatus: number | null;
  fetched_at: string | null;
  error?: UrlFetchError;
};

export type SkippedUrl = {
  url: string;
  reason: 'reddit' | 'non_legal';
};

export type PlaybookFreshness = {
  playbookId: string;
  fetched: UrlFreshness[];
  skipped: SkippedUrl[];
};

export type FreshnessUrl = {
  label: string;
  url: string;
  kind: UrlKind;
};

export type FreshnessPlaybookInput = {
  id: string;
  official_urls: FreshnessUrl[];
  steps: { id: string; official_urls: FreshnessUrl[] }[];
  source_max_age_days?: number;
  last_verified?: string | null;
};

export function sourceMaxAgeDaysFor(playbookId: string): number {
  return playbookId === 'pb-02' || playbookId === 'pb-03' ? 14 : 30;
}

/** last_verified is null/invalid, or older than source_max_age_days. */
export function isLastVerifiedStale(
  lastVerified: string | null | undefined,
  sourceMaxAgeDays: number,
  now: Date = new Date()
): boolean {
  if (!lastVerified) return true;
  const verified = new Date(lastVerified);
  if (Number.isNaN(verified.getTime())) return true;
  const maxAgeMs = sourceMaxAgeDays * 24 * 60 * 60 * 1000;
  return now.getTime() - verified.getTime() > maxAgeMs;
}

export function isRedditUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'reddit.com' || host.endsWith('.reddit.com');
  } catch {
    return false;
  }
}

export function skipReason(item: FreshnessUrl): SkippedUrl['reason'] | null {
  if (isRedditUrl(item.url)) return 'reddit';
  if (item.kind === 'user_report') return 'non_legal';
  if (item.label.includes(NON_LEGAL_SOURCE_LABEL)) return 'non_legal';
  return null;
}

export function shouldSkipOfficialUrl(item: FreshnessUrl): boolean {
  return skipReason(item) !== null;
}

export function collectSkippedUrls(playbook: FreshnessPlaybookInput): SkippedUrl[] {
  const seen = new Set<string>();
  const skipped: SkippedUrl[] = [];
  for (const item of iterPlaybookUrls(playbook)) {
    const reason = skipReason(item);
    if (!reason || seen.has(item.url)) continue;
    seen.add(item.url);
    skipped.push({ url: item.url, reason });
  }
  return skipped;
}

function iterPlaybookUrls(playbook: FreshnessPlaybookInput): FreshnessUrl[] {
  return [
    ...playbook.steps.flatMap((step) => step.official_urls),
    ...playbook.official_urls,
  ];
}

/**
 * Up to 3 fetchable official/guide URLs. Current-step links first, then
 * other steps, then playbook-level. Reddit and 非法律来源 are never fetched.
 */
export function selectUrlsToFetch(
  playbook: FreshnessPlaybookInput,
  options?: { currentStepId?: string; max?: number }
): FreshnessUrl[] {
  const max = options?.max ?? SOURCE_FETCH_MAX_URLS;
  const current =
    playbook.steps.find((step) => step.id === options?.currentStepId) ??
    playbook.steps[0];

  const ordered: FreshnessUrl[] = [];
  if (current) ordered.push(...current.official_urls);
  for (const step of playbook.steps) {
    if (step.id === current?.id) continue;
    ordered.push(...step.official_urls);
  }
  ordered.push(...playbook.official_urls);

  const seen = new Set<string>();
  const selected: FreshnessUrl[] = [];
  for (const item of ordered) {
    if (shouldSkipOfficialUrl(item)) continue;
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    selected.push(item);
    if (selected.length >= max) break;
  }
  return selected;
}

export function formatOfficialFetchedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}

export function freshnessByUrl(
  freshness: PlaybookFreshness | null | undefined
): Record<string, UrlFreshness> {
  const map: Record<string, UrlFreshness> = {};
  for (const item of freshness?.fetched ?? []) {
    map[item.url] = item;
  }
  return map;
}

export type FetchOfficialPageDeps = {
  fetch?: typeof fetch;
  now?: () => Date;
  timeoutMs?: number;
};

/**
 * HTTP GET only. Status 200 → ok + fetched_at. Never returns HTML.
 * Hours, fees, and SOP steps must not be derived from the body.
 */
export async function fetchOfficialPage(
  url: string,
  deps: FetchOfficialPageDeps = {}
): Promise<UrlFreshness> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail(url, 'unsupported');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return fail(url, 'unsupported');
  }

  const fetchFn = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? SOURCE_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': SOURCE_FETCH_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    await discardBody(response);

    if (response.status === 200) {
      return {
        url,
        status: 'ok',
        httpStatus: 200,
        fetched_at: (deps.now ?? (() => new Date()))().toISOString(),
      };
    }
    return {
      url,
      status: 'fail',
      httpStatus: response.status,
      fetched_at: null,
      error: 'http',
    };
  } catch (err) {
    const timeout =
      (err instanceof Error && err.name === 'AbortError') ||
      (err instanceof DOMException && err.name === 'AbortError');
    return fail(url, timeout ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

function fail(url: string, error: UrlFetchError): UrlFreshness {
  return { url, status: 'fail', httpStatus: null, fetched_at: null, error };
}

async function discardBody(response: Response): Promise<void> {
  const body = response.body;
  if (!body) return;
  try {
    if (typeof body.cancel === 'function') {
      await body.cancel();
      return;
    }
  } catch {
    // fall through
  }
}

