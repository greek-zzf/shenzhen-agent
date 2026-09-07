import { and, eq, isNull, lte, ne } from 'drizzle-orm';

import { accommodationReminder } from '@/config/db/schema';
import type { AccommodationReminder } from '@/config/db/schema';
import { envConfigs } from '@/config';
import { db } from '@/core/db';
import { ResendProvider } from '@/core/email/resend';
import { getUuid } from '@/lib/hash';

import {
  buildReminderEmail,
  isEmailConfigured,
  selectDueReminders,
  shouldSendDueReminder,
  type ReminderEmailKind,
} from './email';

export {
  buildReminderEmail,
  computeDueAt,
  isEmailConfigured,
  isHotelStay,
  parseArrivalAt,
  reminderLinks,
  selectDueReminders,
  shouldSendDueReminder,
  TWELVE_HOURS_MS,
  TWENTY_FOUR_HOURS_MS,
  type ReminderEmailKind,
  type ReminderIntent,
} from './email';

export type ReminderView = {
  userId: string;
  arrivalAt: string;
  dueAt: string;
  stayType: string;
  email: string;
  optedIn: boolean;
  sentAt: string | null;
};

export type EmailConfigs = Record<string, string>;

export function toReminderView(row: AccommodationReminder): ReminderView {
  return {
    userId: row.userId,
    arrivalAt: row.arrivalAt.toISOString(),
    dueAt: row.dueAt.toISOString(),
    stayType: row.stayType,
    email: row.email,
    optedIn: row.optedIn,
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
  };
}

export async function getByUserId(
  userId: string
): Promise<AccommodationReminder | null> {
  const [row] = await db()
    .select()
    .from(accommodationReminder)
    .where(eq(accommodationReminder.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertOptIn(params: {
  userId: string;
  email: string;
  arrivalAt: Date;
  dueAt: Date;
  stayType: string;
  optedIn: boolean;
}): Promise<AccommodationReminder> {
  const existing = await getByUserId(params.userId);
  const now = new Date();

  if (!existing) {
    const [row] = await db()
      .insert(accommodationReminder)
      .values({
        id: getUuid(),
        userId: params.userId,
        email: params.email,
        arrivalAt: params.arrivalAt,
        dueAt: params.dueAt,
        stayType: params.stayType,
        optedIn: params.optedIn,
        sentAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  }

  const scheduleChanged =
    existing.arrivalAt.getTime() !== params.arrivalAt.getTime() ||
    existing.dueAt.getTime() !== params.dueAt.getTime();
  const sentAt =
    params.optedIn && scheduleChanged ? null : existing.sentAt;

  const [row] = await db()
    .update(accommodationReminder)
    .set({
      email: params.email,
      arrivalAt: params.arrivalAt,
      dueAt: params.dueAt,
      stayType: params.stayType,
      optedIn: params.optedIn,
      sentAt,
      updatedAt: now,
    })
    .where(eq(accommodationReminder.id, existing.id))
    .returning();
  return row;
}

export async function markSent(
  id: string,
  sentAt: Date | null
): Promise<AccommodationReminder | null> {
  const [row] = await db()
    .update(accommodationReminder)
    .set({ sentAt, updatedAt: new Date() })
    .where(eq(accommodationReminder.id, id))
    .returning();
  return row ?? null;
}

export async function sendReminderEmail(params: {
  to: string;
  kind?: ReminderEmailKind;
  arrivalAt: Date;
  dueAt?: Date;
  configs: EmailConfigs;
}): Promise<{ sent: boolean; configured: boolean; error?: string }> {
  if (!isEmailConfigured(params.configs)) {
    return { sent: false, configured: false };
  }

  try {
    const { subject, text, html } = buildReminderEmail({
      kind: params.kind ?? 'deadline_nudge',
      appUrl: params.configs.app_url || envConfigs.app_url,
      arrivalAt: params.arrivalAt,
      dueAt: params.dueAt,
    });
    const provider = new ResendProvider({
      apiKey: params.configs.resend_api_key,
      defaultFrom: params.configs.resend_sender_email,
    });
    const result = await provider.sendEmail({
      to: params.to,
      subject,
      text,
      html,
    });
    if (!result.success) {
      console.error('[accommodation-reminder] send failed:', result.error);
      return {
        sent: false,
        configured: true,
        error: result.error || 'send failed',
      };
    }
    return { sent: true, configured: true };
  } catch (err) {
    console.error('[accommodation-reminder] send error:', err);
    return {
      sent: false,
      configured: true,
      error: err instanceof Error ? err.message : 'send failed',
    };
  }
}

export type DueSendResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

export async function listDueReminders(
  now = new Date()
): Promise<AccommodationReminder[]> {
  const rows = await db()
    .select()
    .from(accommodationReminder)
    .where(
      and(
        eq(accommodationReminder.optedIn, true),
        isNull(accommodationReminder.sentAt),
        lte(accommodationReminder.dueAt, now),
        ne(accommodationReminder.stayType, 'hotel')
      )
    );
  return selectDueReminders(
    rows.map((row) => ({
      ...row,
      stayType: row.stayType,
    })),
    now
  );
}

/**
 * Process opted-in rows that are due. Sends via Resend once per row.
 * Hotel rows are never selected. Failed sends stay unsent for the next tick.
 */
export async function processDueReminders(
  now = new Date(),
  deps: {
    configs: EmailConfigs;
    send?: typeof sendReminderEmail;
  }
): Promise<DueSendResult> {
  const rows = await listDueReminders(now);
  const configs = deps.configs;
  const send = deps.send ?? sendReminderEmail;

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    if (
      !shouldSendDueReminder(
        {
          optedIn: row.optedIn,
          stayType: row.stayType,
          sentAt: row.sentAt,
          dueAt: row.dueAt,
        },
        now
      )
    ) {
      skipped += 1;
      continue;
    }

    const result = await send({
      to: row.email,
      kind: 'deadline_nudge',
      arrivalAt: row.arrivalAt,
      dueAt: row.dueAt,
      configs,
    });

    if (result.sent) {
      await markSent(row.id, now);
      sent += 1;
    } else {
      errors += 1;
    }
  }

  return { processed: rows.length, sent, skipped, errors };
}
