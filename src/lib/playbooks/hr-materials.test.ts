import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  excerptFromOfficialText,
  extractAllowlistedMaterials,
  fetchHrMaterialsExcerpt,
} from './hr-materials';
import { HR_MATERIALS_URL } from './official-html';

const PAGE_WITH_ITEMS = `
  Application Form for Foreigner's Work Permit
  Applicant's passport or other international travel documents
  Health check certificate
  Employment contract or employment certificate
  Certificate of no criminal record
  Foreigner's Work Permit
  Applicant's Z Visa, R Visa, or valid residence permit
`;

describe('HR materials excerpt', () => {
  it('extracts only allowlisted named items', () => {
    const items = extractAllowlistedMaterials(PAGE_WITH_ITEMS);
    assert.ok(items.includes("Application Form for Foreigner's Work Permit"));
    assert.ok(items.includes('Employment contract'));
    assert.ok(items.includes('Residence permit'));
    assert.equal(items.includes('Registration Form of Temporary Residence'), false);
  });

  it('does not invent a lease requirement from leftover prose', () => {
    const items = extractAllowlistedMaterials(
      `${PAGE_WITH_ITEMS} Some employers ask for a six-month lease. A lease is not listed.`
    );
    assert.equal(
      items.some((item) => /lease/i.test(item)),
      false
    );
    const excerpt = excerptFromOfficialText({
      url: HR_MATERIALS_URL,
      text: 'HR requires a six-month lease. Reddit says otherwise.',
      fetched_at: '2026-09-07T03:00:00.000Z',
      status: 'ok',
    });
    assert.equal(excerpt.status, 'missing');
    assert.deepEqual(excerpt.items, []);
  });

  it('marks fetch failure as stale without items', () => {
    const excerpt = excerptFromOfficialText({
      url: HR_MATERIALS_URL,
      text: null,
      fetched_at: null,
      status: 'fail',
    });
    assert.equal(excerpt.status, 'stale');
    assert.deepEqual(excerpt.items, []);
    assert.equal(excerpt.fetched_at, null);
  });

  it('includes Registration Form of Temporary Residence only when the page names it', () => {
    const excerpt = excerptFromOfficialText({
      url: HR_MATERIALS_URL,
      text: 'Required materials: Registration Form of Temporary Residence. Passport copy.',
      fetched_at: '2026-09-07T03:00:00.000Z',
      status: 'ok',
    });
    assert.equal(excerpt.status, 'ok');
    assert.deepEqual(excerpt.items, ['Registration Form of Temporary Residence']);
  });

  it('live helper uses the mocked official page', async () => {
    const excerpt = await fetchHrMaterialsExcerpt({
      now: () => new Date('2026-09-07T03:00:00.000Z'),
      fetch: async () =>
        new Response(`<p>${PAGE_WITH_ITEMS}</p>`, { status: 200 }),
    });
    assert.equal(excerpt.status, 'ok');
    assert.equal(excerpt.url, HR_MATERIALS_URL);
    assert.ok(excerpt.items.includes('Employment contract'));
  });
});
