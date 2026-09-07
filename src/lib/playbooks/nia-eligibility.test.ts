import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canGroundNiaEligibility,
  detectNationalityRoster,
  fetchNiaEligibility,
  NIA_GROUNDED_SUMMARY,
  summarizeNiaEligibility,
} from './nia-eligibility';
import { NIA_FAQ_URL, NIA_INSTRUCTIONS_URL } from './official-html';

const FAQ_TEXT =
  'Foreign nationals holding ordinary passports, who have urgent needs to enter China but do not have enough time to apply for visas at Chinese embassies or consulates abroad, can apply for port visas for entry.';

const INSTRUCTIONS_TEXT =
  'Foreigners who need to enter China urgently for humanitarian reasons, or are invited to enter China for urgent business activities, and hold supporting materials.';

describe('NIA eligibility grounding', () => {
  it('grounds only on ordinary passport + urgent need with no roster', () => {
    assert.equal(detectNationalityRoster(FAQ_TEXT), false);
    assert.equal(canGroundNiaEligibility(`${FAQ_TEXT} ${INSTRUCTIONS_TEXT}`), true);
  });

  it('refuses to summarize when a nationality roster appears', () => {
    const roster =
      `${FAQ_TEXT} Eligible countries: United States, United Kingdom. Nationals of the following may apply.`;
    assert.equal(detectNationalityRoster(roster), true);
    assert.equal(canGroundNiaEligibility(roster), false);

    const summary = summarizeNiaEligibility([
      {
        url: NIA_FAQ_URL,
        status: 'ok',
        httpStatus: 200,
        fetched_at: '2026-09-07T03:00:00.000Z',
        text: roster,
      },
    ]);
    assert.equal(summary.mode, 'link_only');
    assert.equal(summary.summary, null);
    assert.doesNotMatch(JSON.stringify(summary), /United States|United Kingdom/);
  });

  it('emits the fixed grounded summary and never a country matrix', () => {
    const summary = summarizeNiaEligibility([
      {
        url: NIA_FAQ_URL,
        status: 'ok',
        httpStatus: 200,
        fetched_at: '2026-09-07T03:00:00.000Z',
        text: FAQ_TEXT,
      },
      {
        url: NIA_INSTRUCTIONS_URL,
        status: 'ok',
        httpStatus: 200,
        fetched_at: '2026-09-07T03:01:00.000Z',
        text: INSTRUCTIONS_TEXT,
      },
    ]);
    assert.equal(summary.mode, 'grounded');
    assert.equal(summary.summary, NIA_GROUNDED_SUMMARY);
    assert.match(summary.summary ?? '', /ordinary passport/i);
    assert.match(summary.summary ?? '', /urgent need/i);
    assert.match(summary.summary ?? '', /do not publish a nationality roster/i);
    assert.doesNotMatch(summary.summary ?? '', /United States|eligible countries|6:30|130/);
  });

  it('falls back to link + freshness when HTML cannot be summarized', () => {
    const summary = summarizeNiaEligibility([
      {
        url: NIA_FAQ_URL,
        status: 'ok',
        httpStatus: 200,
        fetched_at: '2026-09-07T03:00:00.000Z',
        text: '<nav>Home Services</nav>',
      },
    ]);
    assert.equal(summary.mode, 'link_only');
    assert.equal(summary.summary, null);
    assert.equal(summary.fetched_at, '2026-09-07T03:00:00.000Z');
  });

  it('fetch helper uses mocked pages and does not invent hours', async () => {
    const result = await fetchNiaEligibility({
      now: () => new Date('2026-09-07T03:00:00.000Z'),
      fetch: async (url) => {
        const href = String(url);
        const text = href.includes('c156102') ? FAQ_TEXT : INSTRUCTIONS_TEXT;
        return new Response(`<p>${text}</p>`, { status: 200 });
      },
    });
    assert.equal(result.mode, 'grounded');
    assert.equal(result.summary, NIA_GROUNDED_SUMMARY);
    assert.doesNotMatch(JSON.stringify(result), /6:30|17:00|130 RMB/);
  });
});
