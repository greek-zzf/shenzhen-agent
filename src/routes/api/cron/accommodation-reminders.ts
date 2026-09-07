import { createFileRoute } from '@tanstack/react-router';

import { respData, respErr } from '@/lib/resp';
import { authorizeCronRequest } from '@/modules/accommodation-reminders/cron-auth';
import { processDueReminders } from '@/modules/accommodation-reminders/service';
import { getAllConfigs } from '@/modules/config/service';

async function handle(request: Request) {
  try {
    const configs = await getAllConfigs();
    const auth = authorizeCronRequest(request, configs);
    if (!auth.ok) {
      return Response.json(
        { code: -1, message: auth.message },
        { status: auth.status, headers: { 'cache-control': 'no-store' } }
      );
    }

    const result = await processDueReminders(new Date(), { configs });
    return respData(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return respErr(message);
  }
}

async function GET({ request }: { request: Request }) {
  return handle(request);
}

async function POST({ request }: { request: Request }) {
  return handle(request);
}

export const Route = createFileRoute('/api/cron/accommodation-reminders')({
  server: {
    handlers: { GET, POST },
  },
});
