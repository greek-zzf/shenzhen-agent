const FALLBACK = '/intake';

/** Only same-origin relative paths. Blocks //evil and https://… open redirects. */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = FALLBACK
): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (value.includes('://')) return fallback;
  if (value.includes('\\')) return fallback;
  return value;
}
