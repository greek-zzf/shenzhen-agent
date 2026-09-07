import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authorizeCronRequest,
  secretsEqual,
} from './cron-auth';

describe('cron auth', () => {
  const secret = 'test-cron-secret-placeholder';

  it('compares secrets in constant-length fashion', () => {
    assert.equal(secretsEqual(secret, secret), true);
    assert.equal(secretsEqual('nope', secret), false);
    assert.equal(secretsEqual('', secret), false);
  });

  it('refuses when CRON_SECRET is missing or short', () => {
    const request = new Request('https://example.com/api/cron/accommodation-reminders', {
      headers: { authorization: `Bearer ${secret}` },
    });
    const missing = authorizeCronRequest(request, {});
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.status, 503);
  });

  it('accepts a matching Bearer token', () => {
    const request = new Request('https://example.com/api/cron/accommodation-reminders', {
      headers: { authorization: `Bearer ${secret}` },
    });
    assert.deepEqual(authorizeCronRequest(request, { cron_secret: secret }), {
      ok: true,
    });
  });

  it('rejects a wrong token', () => {
    const request = new Request('https://example.com/api/cron/accommodation-reminders', {
      headers: { authorization: 'Bearer test-wrong-placeholder' },
    });
    const result = authorizeCronRequest(request, { cron_secret: secret });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
  });
});
