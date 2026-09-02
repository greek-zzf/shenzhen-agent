import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { respData, respErr } from '@/lib/resp';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { getAllConfigs } from '@/modules/config/service';
import {
  getByUserId,
  isEmailConfigured,
  isHotelStay,
  markSent,
  parseArrivalAt,
  sendReminderEmail,
  shouldSendClockStarted,
  toReminderView,
  upsertOptIn,
} from '@/modules/accommodation-reminders/service';

async function GET({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const configs = await getAllConfigs();
    const row = await getByUserId(session.user.id);
    return respData({
      emailConfigured: isEmailConfigured(configs),
      email: session.user.email,
      reminder: row ? toReminderView(row) : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return respErr(message);
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 5_000,
      keyPrefix: 'accommodation-reminder',
      extraKey: session.user.id,
    });
    if (limited) return limited;

    const body = (await request.json().catch(() => ({}))) as {
      optedIn?: unknown;
      arrivalAt?: unknown;
      stayType?: unknown;
    };

    const stayType = typeof body.stayType === 'string' ? body.stayType : '';
    const optedIn = body.optedIn === true;
    if (optedIn && isHotelStay(stayType)) {
      return respErr(
        'Hotels usually file at check-in. Email reminder is not available.'
      );
    }
    const arrivalAt = parseArrivalAt(body.arrivalAt);
    const existing = await getByUserId(session.user.id);
    const resolvedArrival = arrivalAt ?? existing?.arrivalAt ?? null;

    if (optedIn && !resolvedArrival) {
      return respErr('Set your arrival time first.');
    }

    const configs = await getAllConfigs();
    const row = await upsertOptIn({
      userId: session.user.id,
      email: session.user.email,
      arrivalAt: resolvedArrival ?? new Date(),
      optedIn,
    });

    let send: { sent: boolean; configured: boolean; error?: string } = {
      sent: false,
      configured: isEmailConfigured(configs),
    };

    if (
      shouldSendClockStarted({
        optedIn,
        stayType,
        sentAt: row.sentAt,
        emailConfigured: send.configured,
      })
    ) {
      send = await sendReminderEmail({
        to: session.user.email,
        kind: 'clock_started',
        arrivalAt: row.arrivalAt,
        configs,
      });
      if (send.sent) {
        await markSent(row.id, new Date());
      }
    }

    const latest = await getByUserId(session.user.id);
    return respData({
      emailConfigured: isEmailConfigured(configs),
      email: session.user.email,
      reminder: latest ? toReminderView(latest) : null,
      send,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return respErr(message);
  }
}

export const Route = createFileRoute('/api/accommodation-reminders')({
  server: {
    handlers: { GET, POST },
  },
});
