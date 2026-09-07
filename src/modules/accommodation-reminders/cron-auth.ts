/**
 * Shared cron secret check. Empty secret refuses every HTTP caller so the
 * endpoint cannot be triggered by accident. Cloudflare scheduled() bypasses
 * this and calls processDueReminders() directly.
 */

export function cronSecretFromConfigs(
  configs: Record<string, string | undefined> | null | undefined
): string {
  return (configs?.cron_secret || '').trim();
}

export function bearerToken(request: Request): string {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? '';
}

export function secretsEqual(provided: string, expected: string): boolean {
  if (!provided || !expected || provided.length !== expected.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < expected.length; i += 1) {
    out |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}

export function authorizeCronRequest(
  request: Request,
  configs: Record<string, string | undefined> | null | undefined
): { ok: true } | { ok: false; status: number; message: string } {
  const expected = cronSecretFromConfigs(configs);
  if (expected.length < 16) {
    return {
      ok: false,
      status: 503,
      message: 'CRON_SECRET is not configured.',
    };
  }
  if (!secretsEqual(bearerToken(request), expected)) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }
  return { ok: true };
}
