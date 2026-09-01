import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { ProfileCard } from '@/components/copilot/profile-card';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/core/i18n/navigation';
import { attachPlaybooks, primaryAttachedId } from '@/lib/playbooks/attach';
import { PLAYBOOKS } from '@/lib/playbooks/catalog';
import {
  BROKEN_OPTIONS,
  COUNTRY_CHIPS,
  canStartPlaybook,
  DISTRICTS,
  type BrokenFlag,
  type CopilotProfile,
  type District,
  loadProfile,
  saveProfile,
  STAY_TYPES,
  type StayType,
  type VisaType,
  VISA_TYPES,
} from '@/lib/playbooks/profile';
import { cn } from '@/lib/utils';

const VISA_LABEL: Record<VisaType, string> = {
  VOA: '5-day VOA',
  tourist: 'Tourist / other visa',
  work: 'Work / residence in progress',
  residence: 'Residence permit',
  unknown: "I don't know",
};

const STAY_LABEL: Record<StayType, string> = {
  hotel: 'Hotel (they register me)',
  apartment: 'Apartment / sofa / dorm',
  unknown: "I don't know",
};

const DISTRICT_LABEL: Record<District, string> = {
  nanshan: 'Nanshan',
  futian: 'Futian',
  luohu: 'Luohu',
  baoan: "Bao'an",
  longhua: 'Longhua',
  longgang: 'Longgang',
  unknown: "I don't know",
};

const BROKEN_LABEL: Record<BrokenFlag, string> = {
  payments: "Can't pay",
  need_24h: '24h register',
  no_cn_phone: 'No CN phone',
  metro_qr: 'Metro QR',
  hr_lease_6m: 'HR wants a 6-month lease',
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm',
        active
          ? 'border-foreground bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function IntakePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CopilotProfile>(() => loadProfile());
  const [error, setError] = useState('');

  const attached = useMemo(
    () => attachPlaybooks(profile, PLAYBOOKS),
    [profile]
  );

  function update(patch: Partial<CopilotProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      return next;
    });
    setError('');
  }

  function diagnose() {
    if (!canStartPlaybook(profile)) {
      setError('Fill any three fields to start a playbook.');
      return;
    }
    const id = primaryAttachedId(attached);
    router.push(id ? `/run/${id}` : '/library');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Intake</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Not a chat box. Three fields are enough to attach a YAML playbook.
          District can be “I don't know.”
        </p>
      </div>

      <ProfileCard profile={profile} />

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Passport country</h2>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_CHIPS.map((c) => (
            <Chip
              key={c}
              active={profile.passport_country === c}
              onClick={() =>
                update({
                  passport_country: profile.passport_country === c ? '' : c,
                })
              }
            >
              {c === 'unknown' ? "I don't know" : c}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Visa</h2>
        <div className="flex flex-wrap gap-2">
          {VISA_TYPES.map((v) => (
            <Chip
              key={v}
              active={profile.visa_type === v}
              onClick={() =>
                update({ visa_type: profile.visa_type === v ? '' : v })
              }
            >
              {VISA_LABEL[v]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Where are you now?</h2>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={profile.location === 'hk_no_visa'}
            onClick={() =>
              update({
                location:
                  profile.location === 'hk_no_visa' ? '' : 'hk_no_visa',
              })
            }
          >
            In HK without a visa
          </Chip>
          <Chip
            active={profile.location === 'already_in_shenzhen'}
            onClick={() =>
              update({
                location:
                  profile.location === 'already_in_shenzhen'
                    ? ''
                    : 'already_in_shenzhen',
              })
            }
          >
            Already in Shenzhen
          </Chip>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Stay</h2>
        <div className="flex flex-wrap gap-2">
          {STAY_TYPES.map((s) => (
            <Chip
              key={s}
              active={profile.stay_type === s}
              onClick={() =>
                update({ stay_type: profile.stay_type === s ? '' : s })
              }
            >
              {STAY_LABEL[s]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">District</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Chip
              key={d}
              active={profile.district === d}
              onClick={() =>
                update({ district: profile.district === d ? '' : d })
              }
            >
              {DISTRICT_LABEL[d]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">What's broken</h2>
        <div className="flex flex-wrap gap-2">
          {BROKEN_OPTIONS.map((flag) => (
            <Chip
              key={flag}
              active={profile.broken.includes(flag)}
              onClick={() => {
                const next = profile.broken.includes(flag)
                  ? profile.broken.filter((x) => x !== flag)
                  : [...profile.broken, flag];
                update({ broken: next });
              }}
            >
              {BROKEN_LABEL[flag]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Arrival (optional, for the 24h clock)</h2>
        <input
          type="datetime-local"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={
            profile.arrival_at
              ? profile.arrival_at.slice(0, 16)
              : ''
          }
          onChange={(e) =>
            update({
              arrival_at: e.target.value
                ? new Date(e.target.value).toISOString()
                : null,
            })
          }
        />
      </section>

      {attached.length ? (
        <p className="text-sm text-muted-foreground">
          Will attach: {attached.map((pb) => pb.id).join(', ')}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No rule matched yet — you can still open the library.
        </p>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        className="h-12 w-full"
        disabled={!canStartPlaybook(profile)}
        onClick={diagnose}
      >
        Diagnose and open playbook
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/intake')({
  component: IntakePage,
});
