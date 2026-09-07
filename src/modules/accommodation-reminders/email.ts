/**
 * English copy for the 24h temporary-accommodation registration reminder.
 * Calm, short, not legal advice. Never attach passport scans or marketing.
 *
 * Sending strategy: opt-in stores a reminder intent with due_at (arrival + 24h,
 * or a user-set time). A cron / scheduled job sends once when due. Default is
 * OFF. Hotel stays are never scheduled.
 */

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export type ReminderEmailKind = 'deadline_nudge';

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
  kind?: ReminderEmailKind;
  appUrl: string;
  arrivalAt: Date;
  dueAt?: Date;
}): { subject: string; text: string; html: string } {
  const { guideUrl, runUrl } = reminderLinks(params.appUrl);
  const arrival = params.arrivalAt.toISOString();
  const due = (params.dueAt ?? computeDueAt(params.arrivalAt)).toISOString();

  const subject = 'Reminder: 24-hour accommodation registration window';

  const lead =
    'You asked Shenzhen Copilot to email you about the 24-hour temporary accommodation registration deadline (境外人员临时住宿登记).';

  const window = `Arrival you set: ${arrival}. Reminder due: ${due}. Register before the 24-hour window closes. The in-app timer on the playbook still counts down.`;

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

export function computeDueAt(
  arrivalAt: Date,
  userSet?: Date | null
): Date {
  if (userSet && !Number.isNaN(userSet.getTime())) return userSet;
  return new Date(arrivalAt.getTime() + TWENTY_FOUR_HOURS_MS);
}

export type ReminderIntent = {
  id?: string;
  optedIn: boolean;
  stayType: string | null | undefined;
  sentAt: Date | null | undefined;
  dueAt: Date;
  arrivalAt?: Date;
};

/**
 * Cron decision: send once when opted in, not a hotel, not yet sent, and now >= due_at.
 */
export function shouldSendDueReminder(
  params: ReminderIntent,
  now: Date
): boolean {
  if (!params.optedIn) return false;
  if (isHotelStay(params.stayType)) return false;
  if (params.sentAt) return false;
  return now.getTime() >= params.dueAt.getTime();
}

export function selectDueReminders<T extends ReminderIntent>(
  rows: T[],
  now: Date
): T[] {
  return rows.filter((row) => shouldSendDueReminder(row, now));
}
