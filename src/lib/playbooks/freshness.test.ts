import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  collectSkippedUrls,
  fetchOfficialPage,
  formatOfficialFetchedAt,
  isLastVerifiedStale,
  isRedditUrl,
  selectUrlsToFetch,
  shouldSkipOfficialUrl,
  sourceMaxAgeDaysFor,
  type FreshnessPlaybookInput,
  type FreshnessUrl,
} from './freshness';

function url(
  partial: Pick<FreshnessUrl, 'url'> & Partial<FreshnessUrl>
): FreshnessUrl {
  return {
    label: partial.label ?? 'source',
    kind: partial.kind ?? 'official',
    url: partial.url,
  };
}

function playbook(
  overrides: Partial<FreshnessPlaybookInput> = {}
): FreshnessPlaybookInput {
  return {
    id: 'pb-01',
    official_urls: [],
    steps: [],
    source_max_age_days: 30,
    last_verified: null,
    ...overrides,
  };
}

describe('URL filtering', () => {
  it('skips reddit.com and subdomains', () => {
    assert.equal(isRedditUrl('https://www.reddit.com/r/shenzhen/comments/x/'), true);
    assert.equal(isRedditUrl('https://old.reddit.com/r/shenzhen/comments/x/'), true);
    assert.equal(isRedditUrl('https://reddit.com/r/shenzhen/'), true);
    assert.equal(isRedditUrl('https://www.sz.gov.cn/en/'), false);
    assert.equal(isRedditUrl('https://notreddit.com/'), false);
  });

  it('skips user_report and 非法律来源 labels; keeps 指南, 非法律 guides', () => {
    assert.equal(
      shouldSkipOfficialUrl(
        url({
          url: 'https://hishenzhen.com/guide',
          kind: 'guide',
          label: 'HiShenzhen — 指南, 非法律',
        })
      ),
      false
    );
    assert.equal(
      shouldSkipOfficialUrl(
        url({
          url: 'https://www.sz.gov.cn/en/',
          kind: 'official',
          label: 'City English page',
        })
      ),
      false
    );
    assert.equal(
      shouldSkipOfficialUrl(
        url({
          url: 'https://example.com/thread',
          kind: 'user_report',
          label: 'forum note',
        })
      ),
      true
    );
    assert.equal(
      shouldSkipOfficialUrl(
        url({
          url: 'https://example.com/note',
          kind: 'official',
          label: 'r/shenzhen 1upmequ (非法律来源)',
        })
      ),
      true
    );
  });

  it('never selects reddit even when listed on the current step', () => {
    const pb = playbook({
      id: 'pb-10',
      steps: [
        {
          id: 'sit-sources-side-by-side',
          official_urls: [
            url({
              url: 'https://www.reddit.com/r/shenzhen/comments/1upmequ/',
              kind: 'user_report',
              label: 'r/shenzhen 1upmequ (非法律来源)',
            }),
            url({
              url: 'https://www.sz.gov.cn/en_szgov/news/page.html',
              kind: 'official',
              label: 'sz.gov.cn English',
            }),
          ],
        },
      ],
      official_urls: [
        url({
          url: 'https://www.reddit.com/r/shenzhen/comments/1upmequ/',
          kind: 'user_report',
          label: 'r/shenzhen 1upmequ (非法律来源)',
        }),
      ],
    });

    const selected = selectUrlsToFetch(pb, {
      currentStepId: 'sit-sources-side-by-side',
    });
    assert.deepEqual(
      selected.map((item) => item.url),
      ['https://www.sz.gov.cn/en_szgov/news/page.html']
    );
    assert.deepEqual(collectSkippedUrls(pb), [
      {
        url: 'https://www.reddit.com/r/shenzhen/comments/1upmequ/',
        reason: 'reddit',
      },
    ]);
  });

  it('prioritizes the current step, then other steps, then playbook URLs, max 3', () => {
    const pb = playbook({
      official_urls: [
        url({ url: 'https://playbook.example/a', label: 'A' }),
        url({ url: 'https://playbook.example/b', label: 'B' }),
        url({ url: 'https://playbook.example/c', label: 'C' }),
      ],
      steps: [
        {
          id: 'first',
          official_urls: [url({ url: 'https://step.example/one', label: 'S1' })],
        },
        {
          id: 'second',
          official_urls: [
            url({ url: 'https://step.example/two', label: 'S2' }),
            url({ url: 'https://playbook.example/a', label: 'dup A' }),
          ],
        },
      ],
    });

    const selected = selectUrlsToFetch(pb, { currentStepId: 'second' });
    assert.deepEqual(
      selected.map((item) => item.url),
      [
        'https://step.example/two',
        'https://playbook.example/a',
        'https://step.example/one',
      ]
    );
  });
});

describe('stale math', () => {
  const now = new Date('2026-09-01T12:00:00.000Z');

  it('treats null last_verified as stale (draft badge stays on)', () => {
    assert.equal(isLastVerifiedStale(null, 30, now), true);
    assert.equal(isLastVerifiedStale(undefined, 14, now), true);
    assert.equal(isLastVerifiedStale('', 30, now), true);
  });

  it('uses 14 days for pb-02/pb-03 and 30 for others', () => {
    assert.equal(sourceMaxAgeDaysFor('pb-02'), 14);
    assert.equal(sourceMaxAgeDaysFor('pb-03'), 14);
    assert.equal(sourceMaxAgeDaysFor('pb-01'), 30);
    assert.equal(sourceMaxAgeDaysFor('pb-04'), 30);
    assert.equal(sourceMaxAgeDaysFor('pb-05'), 30);
    assert.equal(sourceMaxAgeDaysFor('pb-10'), 30);
  });

  it('is stale only after source_max_age_days', () => {
    assert.equal(isLastVerifiedStale('2026-08-22T12:00:00.000Z', 14, now), false);
    assert.equal(isLastVerifiedStale('2026-08-17T11:59:59.000Z', 14, now), true);
    assert.equal(isLastVerifiedStale('2026-08-10T12:00:00.000Z', 30, now), false);
    assert.equal(isLastVerifiedStale('2026-07-31T12:00:00.000Z', 30, now), true);
  });

  it('treats invalid dates as stale', () => {
    assert.equal(isLastVerifiedStale('not-a-date', 30, now), true);
  });
});

describe('official page fetch (mocked)', () => {
  it('records fetched_at on HTTP 200 and never returns HTML', async () => {
    const fetchedAt = new Date('2026-09-01T19:32:00.000Z');
    const result = await fetchOfficialPage('https://www.sz.gov.cn/en/', {
      now: () => fetchedAt,
      fetch: async () =>
        new Response('<html><body>VOA 6:30–24:00 fee ¥160</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
    });

    assert.equal(result.status, 'ok');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.fetched_at, '2026-09-01T19:32:00.000Z');
    assert.equal('body' in result, false);
    assert.equal(JSON.stringify(result).includes('6:30'), false);
    assert.equal(JSON.stringify(result).includes('¥160'), false);
  });

  it('marks 404 and timeout as fail without throwing', async () => {
    const notFound = await fetchOfficialPage('https://www.sz.gov.cn/missing', {
      fetch: async () => new Response('nope', { status: 404 }),
    });
    assert.equal(notFound.status, 'fail');
    assert.equal(notFound.httpStatus, 404);
    assert.equal(notFound.fetched_at, null);
    assert.equal(notFound.error, 'http');

    const timedOut = await fetchOfficialPage('https://www.sz.gov.cn/slow', {
      timeoutMs: 5,
      fetch: async (_url, init) => {
        await new Promise<void>((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
        return new Response('late', { status: 200 });
      },
    });
    assert.equal(timedOut.status, 'fail');
    assert.equal(timedOut.error, 'timeout');
    assert.equal(timedOut.fetched_at, null);
  });

  it('rejects non-http URLs', async () => {
    const result = await fetchOfficialPage('file:///etc/passwd');
    assert.equal(result.status, 'fail');
    assert.equal(result.error, 'unsupported');
  });

  it('formats fetched timestamps in UTC', () => {
    assert.equal(
      formatOfficialFetchedAt('2026-09-01T19:32:00.000Z'),
      '2026-09-01 19:32 UTC'
    );
  });
});
