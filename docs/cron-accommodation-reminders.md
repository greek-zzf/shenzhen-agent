# 24-hour accommodation reminder cron

PB-02 can email a user **once** when a stored reminder is due. Opt-in is **off**
by default. Hotel stays are never stored as opted-in and are never sent.

`due_at` is `arrival + 24h`, or a time the user sets. Checking the box only
stores the intent — it does not send mail.

## What runs

`processDueReminders()` in `src/modules/accommodation-reminders/service.ts`:

1. Load rows with `opted_in = true`, `sent_at` null, `due_at <= now`, `stay_type ≠ hotel`
2. Send the existing Resend template
3. Mark `sent_at` only after a successful send (retry next tick on failure)

## Enable on Cloudflare Workers

1. Copy the cron trigger from `wrangler.example.jsonc` into your gitignored
   `wrangler.jsonc` if the working copy predates this change:

   ```jsonc
   "triggers": {
     "crons": ["0 * * * *"]
   }
   ```

2. Redeploy (`pnpm cf:deploy` / `/deploy-cloudflare`). The Worker `scheduled()`
   handler in `src/server.ts` calls the processor directly. No HTTP secret is
   required for that path.

3. Configure Resend in Admin → Settings (or `resend_api_key` /
   `resend_sender_email`). Without Resend, rows stay unsent.

4. After a schema change, push `due_at` and `stay_type` on
   `accommodation_reminder` (`pnpm db:push` in development; generate + migrate
   in production).

Hourly is enough for a 24-hour legal clock. Tighten the expression if you want.

## External cron (Nitro / any host)

If you are not on Workers, or you want a second trigger:

1. Set `CRON_SECRET` (at least 16 characters). Example:
   `openssl rand -base64 32`
2. Hit the secure endpoint on a schedule:

   ```bash
   curl -X POST \
     -H "Authorization: Bearer $CRON_SECRET" \
     https://YOUR_APP/api/cron/accommodation-reminders
   ```

   GET with the same header is accepted. The endpoint returns 503 if
   `CRON_SECRET` is unset, 401 if the token is wrong.

Example crontab (every hour):

```
0 * * * * curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://YOUR_APP/api/cron/accommodation-reminders
```

## What this does not do

- No SMS, WeChat, or push
- No immediate “clock started” email
- No VOA / nationality mail
- Does not set `last_verified` on any SOP
