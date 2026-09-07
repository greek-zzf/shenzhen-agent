import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { apiGet, apiPost } from '@/lib/api-client';
import { formatOfficialFetchedAt } from '@/lib/playbooks/freshness';

import { ArrivalTimer } from './slots';

export type ReminderView = {
  userId: string;
  arrivalAt: string;
  dueAt: string;
  stayType: string;
  email: string;
  optedIn: boolean;
  sentAt: string | null;
};

export type ReminderResponse = {
  emailConfigured: boolean;
  email: string;
  reminder: ReminderView | null;
  scheduled?: boolean;
};

function parseDueInput(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function AccommodationReminderOptIn({
  arrivalAt,
  stayType,
  showTimer = false,
}: {
  arrivalAt: string | null;
  stayType: string;
  showTimer?: boolean;
}) {
  const queryClient = useQueryClient();
  const hotel = stayType === 'hotel';
  const [dueAtInput, setDueAtInput] = useState('');

  const query = useQuery({
    queryKey: ['accommodation-reminder'],
    queryFn: () => apiGet<ReminderResponse>('/api/accommodation-reminders'),
  });

  const mutation = useMutation({
    mutationFn: (optedIn: boolean) =>
      apiPost<ReminderResponse>('/api/accommodation-reminders', {
        optedIn,
        arrivalAt,
        stayType,
        dueAt: parseDueInput(dueAtInput),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['accommodation-reminder'], data);
      if (data.reminder?.optedIn) {
        const due = data.reminder.dueAt
          ? formatOfficialFetchedAt(data.reminder.dueAt)
          : 'arrival + 24 hours';
        if (!data.emailConfigured) {
          toast.success(
            `Reminder scheduled for ${due}. Email is not configured — the timer still runs here.`
          );
        } else {
          toast.success(`Reminder scheduled for ${due}. Nothing is sent until then.`);
        }
      } else {
        toast.success('Email reminder turned off.');
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const optedIn = query.data?.reminder?.optedIn === true;
  const shownChecked = optedIn && !hotel;
  const emailConfigured = query.data?.emailConfigured;
  const disableToggle =
    mutation.isPending ||
    query.isPending ||
    hotel ||
    (!arrivalAt && !shownChecked);

  return (
    <section className="space-y-3 rounded-lg border border-border px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        24-hour registration reminder
      </p>
      {showTimer ? (
        <ArrivalTimer arrivalAt={arrivalAt} label="24 hours from arrival" />
      ) : null}

      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={shownChecked}
          disabled={disableToggle}
          onCheckedChange={(value) => mutation.mutate(value === true)}
          className="mt-0.5"
        />
        <span className="text-sm leading-6">
          Email me at the 24-hour mark (arrival + 24h, or a time I set). Off by
          default.
        </span>
      </label>

      {hotel ? (
        <p className="text-sm text-muted-foreground">
          Hotels usually file at check-in. No email reminder for a hotel stay.
        </p>
      ) : null}

      {!hotel && !arrivalAt ? (
        <p className="text-sm text-muted-foreground">
          Set your arrival time on intake to start the 24-hour clock.
        </p>
      ) : null}

      {!hotel && arrivalAt ? (
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            Remind at (optional — default is arrival + 24 hours)
          </span>
          <Input
            type="datetime-local"
            value={dueAtInput}
            disabled={disableToggle}
            onChange={(e) => setDueAtInput(e.target.value)}
          />
        </label>
      ) : null}

      {query.data && emailConfigured === false && !hotel ? (
        <p className="text-xs text-muted-foreground">
          Email is not configured. The 24-hour timer and opt-in state still work
          here. Cron will not send until Resend is set.
        </p>
      ) : null}

      {shownChecked && query.data?.reminder?.dueAt ? (
        <p className="text-xs text-muted-foreground">
          Scheduled for {formatOfficialFetchedAt(query.data.reminder.dueAt)}
          {query.data.reminder.sentAt
            ? `. Sent once to ${query.data.email}.`
            : '. Not sent yet.'}
        </p>
      ) : null}
    </section>
  );
}
