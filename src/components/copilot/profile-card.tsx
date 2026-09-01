import type { CopilotProfile } from '@/lib/playbooks/profile';

function display(value: string | null | undefined): string {
  if (!value) return 'Not set';
  if (value === 'unknown') return "I don't know";
  if (value === 'hk_no_visa') return 'In HK without a visa';
  if (value === 'need_24h') return '24h register';
  if (value === 'no_cn_phone') return 'No CN phone';
  if (value === 'metro_qr') return 'Metro QR';
  if (value === 'hr_lease_6m') return 'HR 6-month lease';
  if (value === 'payments') return "Can't pay";
  return value;
}

export function ProfileCard({ profile }: { profile: CopilotProfile }) {
  return (
    <section className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Profile
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Passport</dt>
          <dd className="font-medium">{display(profile.passport_country)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Visa</dt>
          <dd className="font-medium">{display(profile.visa_type)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Stay</dt>
          <dd className="font-medium">{display(profile.stay_type)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">District</dt>
          <dd className="font-medium">{display(profile.district)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Broken</dt>
          <dd className="font-medium">
            {profile.broken.length
              ? profile.broken.map(display).join(' · ')
              : 'Not set'}
          </dd>
        </div>
        {profile.location ? (
          <div className="col-span-2">
            <dt className="text-muted-foreground">Where now</dt>
            <dd className="font-medium">{display(profile.location)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
