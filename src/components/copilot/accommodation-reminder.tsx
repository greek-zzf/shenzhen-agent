import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { apiGet, apiPost } from '@/lib/api-client';

import { ArrivalTimer } from './slots';

export type ReminderView = {
  userId: string;
  arrivalAt: string;
  email: string;
  optedIn: boolean;
  sentAt: string | null;
};

export type ReminderResponse = {
  emailConfigured: boolean;
  email: string;
  reminder: ReminderView | null;
  send?: { sent: boolean; configured: boolean; error?: string };
};

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
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['accommodation-reminder'], data);
      if (data.reminder?.optedIn && data.send?.sent) {
        toast.success('Clock-started email sent.');
      } else if (data.reminder?.optedIn && !data.emailConfigured) {
        toast.success('Opted in. Email is not configured — the timer still runs here.');
      } else if (data.reminder?.optedIn && data.send && !data.send.sent) {
        toast.success('Opted in. Email could not be sent; the timer still runs here.');
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
          Email me before the 24h registration deadline.
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

      {query.data && emailConfigured === false && !hotel ? (
        <p className="text-xs text-muted-foreground">
          Email is not configured. The 24-hour timer and opt-in state still work
          here.
        </p>
      ) : null}

      {shownChecked && query.data?.reminder?.sentAt ? (
        <p className="text-xs text-muted-foreground">
          Clock-started email sent to {query.data.email}. The in-app timer still
          counts down.
        </p>
      ) : null}
    </section>
  );
}
