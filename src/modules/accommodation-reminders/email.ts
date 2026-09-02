/**
 * English copy for the 24h temporary-accommodation registration reminder.
 * Calm, short, not legal advice. Never attach passport scans or marketing.
 *
 * Sending strategy in this repo: no Cloudflare cron / scripts job exists, so
 * opt-in sends a T+0 "clock started" email that explains the 12h / 24h window.
 * `deadline_nudge` is kept for a future T+12h scheduler.
 */

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export type ReminderEmailKind = 'clock_started' | 'deadline_nudge';

const DISCLAIMER =
  'This is a procedure guide, not legal, medical, or immigration advice.';

function trimAppUrl(appUrl: string): string {
  return appUrl.replace(/\/+$/, '');
}

export function reminderLinks(appUrl: string): {
  guideUrl: string;
  runUrl: string;
} {
  const base = trimAppUrl(appUrl);
  return {
    guideUrl: `${base}/p/accommodation-registration`,
    runUrl: `${base}/run/pb-02`,
  };
}

export function buildReminderEmail(params: {
  kind: ReminderEmailKind;
  appUrl: string;
  arrivalAt: Date;
}): { subject: string; text: string; html: string } {
  const { guideUrl, runUrl } = reminderLinks(params.appUrl);
  const arrival = params.arrivalAt.toISOString();

  const subject =
    params.kind === 'clock_started'
      ? '24-hour accommodation registration clock started'
      : 'Reminder: 24-hour accommodation registration window';

  const lead =
    params.kind === 'clock_started'
      ? 'You asked Shenzhen Copilot to email you about the 24-hour temporary accommodation registration clock (境外人员临时住宿登记). The clock starts at the arrival time you set.'
      : 'You asked Shenzhen Copilot to email you before the 24-hour temporary accommodation registration deadline (境外人员临时住宿登记).';

  const window =
    params.kind === 'clock_started'
      ? `Arrival you set: ${arrival}. You have 24 hours from that time. Around the 12-hour mark is a calm moment to check that you are registered. The in-app timer on the playbook still counts down.`
      : `Arrival you set: ${arrival}. The 24-hour window is still open. Register before it closes. The in-app timer on the playbook still counts down.`;

  const body = [
    lead,
    window,
    'A hotel may have filed already at check-in. An apartment, dorm, or friend’s place usually needs a self-registration.',
    'Scan the 房屋码 (house QR) in 深圳公安. Do not type a street address. If that path fails, verify at the window (Shekou MSCE or the covering 派出所).',
    `Guide: ${guideUrl}`,
    `Playbook: ${runUrl}`,
    DISCLAIMER,
  ].join('\n\n');

  const html = `<p>${lead}</p>
<p>${window}</p>
<p>A hotel may have filed already at check-in. An apartment, dorm, or friend’s place usually needs a self-registration.</p>
<p>Scan the 房屋码 (house QR) in 深圳公安. Do not type a street address. If that path fails, verify at the window (Shekou MSCE or the covering 派出所).</p>
<p><a href="${guideUrl}">Accommodation registration guide</a><br />
<a href="${runUrl}">Open the 24-hour playbook</a></p>
<p>${DISCLAIMER}</p>`;

  return { subject, text: body, html };
}

export function isHotelStay(stayType: string | null | undefined): boolean {
  return stayType === 'hotel';
}

export function isEmailConfigured(
  configs: Record<string, string | undefined> | null | undefined
): boolean {
  return Boolean(configs?.resend_api_key && configs?.resend_sender_email);
}

export function parseArrivalAt(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function shouldSendClockStarted(params: {
  optedIn: boolean;
  stayType: string | null | undefined;
  sentAt: Date | null | undefined;
  emailConfigured: boolean;
}): boolean {
  if (!params.optedIn) return false;
  if (isHotelStay(params.stayType)) return false;
  if (params.sentAt) return false;
  return params.emailConfigured;
}

export function shouldSendDeadlineNudge(params: {
  optedIn: boolean;
  stayType: string | null | undefined;
  sentAt: Date | null | undefined;
  arrivalAt: Date;
  now: Date;
}): boolean {
  if (!params.optedIn) return false;
  if (isHotelStay(params.stayType)) return false;
  if (params.sentAt) return false;
  const elapsed = params.now.getTime() - params.arrivalAt.getTime();
  return elapsed >= TWELVE_HOURS_MS && elapsed < TWENTY_FOUR_HOURS_MS;
}
