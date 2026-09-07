import {
  SOURCE_FETCH_CACHE_TTL_MS,
  SOURCE_FETCH_TIMEOUT_MS,
  SOURCE_FETCH_USER_AGENT,
  type UrlFetchError,
} from './freshness';

type CacheEntry = {
  expiresAt: number;
  value: OfficialHtmlResult;
};

const htmlCache = new Map<string, CacheEntry>();

export function resetOfficialHtmlCache(): void {
  htmlCache.clear();
}

export const OFFICIAL_HTML_MAX_BYTES = 512_000;

/** Hosts we are allowed to GET HTML from. Never take a URL from the client. */
export const OFFICIAL_HTML_HOSTS = new Set([
  'www.sz.gov.cn',
  'sz.gov.cn',
  'en.nia.gov.cn',
]);

export const HR_MATERIALS_URL =
  'https://www.sz.gov.cn/en_szgov/news/infocus/SZCitywalk/Explore/Plan/content/post_11845338.html';

export const NIA_FAQ_URL =
  'https://en.nia.gov.cn/n147418/n147463/c156102/content.html';

export const NIA_INSTRUCTIONS_URL =
  'https://en.nia.gov.cn/n147423/n147478/n147715/c158232/content.html';

export type OfficialHtmlResult = {
  url: string;
  status: 'ok' | 'fail';
  httpStatus: number | null;
  fetched_at: string | null;
  text: string | null;
  error?: UrlFetchError;
};

export type FetchOfficialHtmlDeps = {
  fetch?: typeof fetch;
  now?: () => Date;
  timeoutMs?: number;
  maxBytes?: number;
};

export function isAllowlistedOfficialUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase();
    if (isBlockedHost(host)) return false;
    return OFFICIAL_HTML_HOSTS.has(host);
  } catch {
    return false;
  }
}

function isBlockedHost(host: string): boolean {
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host === '0.0.0.0' || host === '::1') return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  return false;
}

export function htmlToVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function fail(url: string, error: UrlFetchError): OfficialHtmlResult {
  return {
    url,
    status: 'fail',
    httpStatus: null,
    fetched_at: null,
    text: null,
    error,
  };
}

/**
 * GET allowlisted official HTML and keep visible text only.
 * Hours, fees, and nationality lists must be decided by the caller — this
 * function does not interpret them.
 */
export async function fetchOfficialHtml(
  url: string,
  deps: FetchOfficialHtmlDeps = {}
): Promise<OfficialHtmlResult> {
  if (!isAllowlistedOfficialUrl(url)) {
    return fail(url, 'unsupported');
  }

  const cached = htmlCache.get(url);
  const nowMs = (deps.now ?? (() => new Date()))().getTime();
  if (!deps.fetch && cached && cached.expiresAt > nowMs) {
    return cached.value;
  }

  const fetchFn = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? SOURCE_FETCH_TIMEOUT_MS;
  const maxBytes = deps.maxBytes ?? OFFICIAL_HTML_MAX_BYTES;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchWithSafeRedirects(url, fetchFn, controller.signal);
    if (!response) return fail(url, 'unsupported');

    if (response.status !== 200) {
      await safeDiscard(response);
      return {
        url,
        status: 'fail',
        httpStatus: response.status,
        fetched_at: null,
        text: null,
        error: 'http',
      };
    }

    const html = await readBodyCapped(response, maxBytes);
    const value: OfficialHtmlResult = {
      url,
      status: 'ok',
      httpStatus: 200,
      fetched_at: (deps.now ?? (() => new Date()))().toISOString(),
      text: htmlToVisibleText(html),
    };
    if (!deps.fetch) {
      htmlCache.set(url, { expiresAt: nowMs + SOURCE_FETCH_CACHE_TTL_MS, value });
    }
    return value;
  } catch (err) {
    const timeout =
      (err instanceof Error && err.name === 'AbortError') ||
      (err instanceof DOMException && err.name === 'AbortError');
    return fail(url, timeout ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithSafeRedirects(
  url: string,
  fetchFn: typeof fetch,
  signal: AbortSignal,
  hops = 0
): Promise<Response | null> {
  if (hops > 3) return null;
  if (!isAllowlistedOfficialUrl(url)) return null;

  const response = await fetchFn(url, {
    method: 'GET',
    redirect: 'manual',
    signal,
    headers: {
      'User-Agent': SOURCE_FETCH_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    await safeDiscard(response);
    if (!location) return null;
    const next = new URL(location, url).href;
    return fetchWithSafeRedirects(next, fetchFn, signal, hops + 1);
  }

  return response;
}

async function readBodyCapped(response: Response, maxBytes: number): Promise<string> {
  const raw = await response.arrayBuffer();
  const slice = raw.byteLength > maxBytes ? raw.slice(0, maxBytes) : raw;
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}

async function safeDiscard(response: Response): Promise<void> {
  try {
    if (typeof response.body?.cancel === 'function') {
      await response.body.cancel();
    }
  } catch {
    // ignore
  }
}
