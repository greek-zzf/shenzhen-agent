import { getPlaybook } from './catalog';
import {
  collectSkippedUrls,
  fetchOfficialPage,
  selectUrlsToFetch,
  SOURCE_FETCH_CACHE_TTL_MS,
  type PlaybookFreshness,
  type UrlFreshness,
} from './freshness';

type CacheEntry = {
  expiresAt: number;
  value: UrlFreshness;
};

const cache = new Map<string, CacheEntry>();

export function resetFreshnessCache(): void {
  cache.clear();
}

export function readFreshnessCache(
  url: string,
  nowMs = Date.now()
): UrlFreshness | null {
  const hit = cache.get(url);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs) {
    cache.delete(url);
    return null;
  }
  return hit.value;
}

function writeFreshnessCache(
  value: UrlFreshness,
  nowMs = Date.now(),
  ttlMs = SOURCE_FETCH_CACHE_TTL_MS
): void {
  cache.set(value.url, { expiresAt: nowMs + ttlMs, value });
}

/**
 * Fetch up to 3 official/guide pages for a playbook view.
 * Cache TTL is 6 hours. Failures are cached too so we do not hammer .gov.cn.
 * HTML is discarded — this never rewrites SOP steps or invents hours/fees.
 */
export async function refreshPlaybookSources(params: {
  playbookId: string;
  currentStepId?: string;
}): Promise<PlaybookFreshness> {
  const playbook = getPlaybook(params.playbookId);
  if (!playbook) {
    return { playbookId: params.playbookId, fetched: [], skipped: [] };
  }

  const targets = selectUrlsToFetch(playbook, {
    currentStepId: params.currentStepId,
  });
  const skipped = collectSkippedUrls(playbook);

  const fetched = await Promise.all(
    targets.map(async (item) => {
      const cached = readFreshnessCache(item.url);
      if (cached) return cached;
      const result = await fetchOfficialPage(item.url);
      writeFreshnessCache(result);
      return result;
    })
  );

  return { playbookId: playbook.id, fetched, skipped };
}
