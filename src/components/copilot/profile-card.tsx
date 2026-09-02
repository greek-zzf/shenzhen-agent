import type { CopilotProfile } from '@/lib/playbooks/profile';

function display(value: string | null | undefined): string {
  if (!value) return 'Not set';
  if (value === 'unknown') return "I don't know";
  if (value === 'hk_no_visa') return 'In HK without a visa';
  if (value === 'already_in_shenzhen') return 'Already in Shenzhen';
  if (value === 'already_in_city') return 'Already in the city';
  if (value === 'need_24h') return '24h register';
  if (value === 'no_cn_phone') return 'No CN phone';
  if (value === 'metro_qr') return 'Metro QR';
  if (value === 'hr_lease_6m') return 'HR 6-month lease';
  if (value === 'payments') return "Can't pay";
  if (value === 'works') return 'Works';
  if (value === 'dead') return 'Dead';
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  if (value === 'hotel') return 'Hotel';
  if (value === 'apartment') return 'Apartment';
  return value;
}

function arrivalLabel(iso: string | null): string {
  if (!iso) return 'Not set';
  const day = iso.slice(0, 10);
  return day || iso;
}

export function ProfileCard({ profile }: { profile: CopilotProfile }) {
  return (
    <section className="rounded-[1.75rem] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
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
        <div>
          <dt className="text-muted-foreground">WeChat Pay</dt>
          <dd className="font-medium">{display(profile.wechat_pay)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Alipay</dt>
          <dd className="font-medium">{display(profile.alipay)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">CN phone</dt>
          <dd className="font-medium">{display(profile.has_cn_phone)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">CN bank</dt>
          <dd className="font-medium">{display(profile.has_cn_bank)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Arrival</dt>
          <dd className="font-medium">{arrivalLabel(profile.arrival_at)}</dd>
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
