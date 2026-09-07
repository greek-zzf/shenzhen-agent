import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fetchOfficialHtml,
  htmlToVisibleText,
  HR_MATERIALS_URL,
  isAllowlistedOfficialUrl,
  NIA_FAQ_URL,
} from './official-html';

describe('official HTML allowlist', () => {
  it('allows only the official hosts used by HR and NIA', () => {
    assert.equal(isAllowlistedOfficialUrl(HR_MATERIALS_URL), true);
    assert.equal(isAllowlistedOfficialUrl(NIA_FAQ_URL), true);
    assert.equal(isAllowlistedOfficialUrl('https://www.reddit.com/r/shenzhen/'), false);
    assert.equal(isAllowlistedOfficialUrl('http://127.0.0.1/'), false);
    assert.equal(isAllowlistedOfficialUrl('https://169.254.169.254/latest'), false);
    assert.equal(isAllowlistedOfficialUrl('file:///etc/passwd'), false);
  });

  it('strips tags and scripts without keeping hours as structured data', () => {
    const text = htmlToVisibleText(
      '<html><script>alert(1)</script><p>Registration Form of Temporary Residence</p><style>b{}</style></html>'
    );
    assert.match(text, /Registration Form of Temporary Residence/);
    assert.doesNotMatch(text, /alert/);
  });

  it('rejects a non-allowlisted URL without fetching', async () => {
    const result = await fetchOfficialHtml('https://evil.example/hours', {
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    assert.equal(result.status, 'fail');
    assert.equal(result.error, 'unsupported');
    assert.equal(result.text, null);
  });

  it('keeps text on HTTP 200 and refuses a redirect off-allowlist', async () => {
    const fetchedAt = new Date('2026-09-07T03:00:00.000Z');
    const ok = await fetchOfficialHtml(HR_MATERIALS_URL, {
      now: () => fetchedAt,
      fetch: async () =>
        new Response('<p>Application Form for Foreigner\'s Work Permit</p>', {
          status: 200,
        }),
    });
    assert.equal(ok.status, 'ok');
    assert.equal(ok.fetched_at, '2026-09-07T03:00:00.000Z');
    assert.match(ok.text ?? '', /Application Form for Foreigner's Work Permit/);

    const bounced = await fetchOfficialHtml(HR_MATERIALS_URL, {
      fetch: async () =>
        new Response('', {
          status: 302,
          headers: { location: 'https://evil.example/steal' },
        }),
    });
    assert.equal(bounced.status, 'fail');
    assert.equal(bounced.error, 'unsupported');
  });
});
