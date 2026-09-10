import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { ProfileCard } from '@/components/copilot/profile-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link, useRouter } from '@/core/i18n/navigation';
import { attachPlaybooks, primaryAttachedId } from '@/lib/playbooks/attach';
import { PLAYBOOKS } from '@/lib/playbooks/catalog';
import {
  fillIntakeProfileFn,
  getIntakeAssistStatusFn,
} from '@/lib/playbooks/fill-profile';
import { applyIntakeFill, syncDerivedBroken } from '@/lib/playbooks/intake-fill';
import {
  BROKEN_OPTIONS,
  COUNTRY_CHIPS,
  canStartPlaybook,
  DISTRICTS,
  PAY_STATES,
  type BrokenFlag,
  type CopilotProfile,
  type District,
  type PayState,
  type StayType,
  type VisaType,
  type YesNoUnknown,
  loadProfile,
  saveProfile,
  STAY_TYPES,
  VISA_TYPES,
  YES_NO_UNKNOWN,
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
  bank: 'Need a mainland bank account',
  housing: 'Housing / lease / 网签',
  hospital: 'Need a hospital / English clinic',
  animal_bite: 'Animal bite / scratch',
  work_permit: 'Work / residence permit checklist',
};

const PAY_LABEL: Record<PayState, string> = {
  works: 'Works',
  dead: 'Dead',
  unknown: "I don't know",
};

const YES_NO_LABEL: Record<YesNoUnknown, string> = {
  yes: 'Yes',
  no: 'No',
  unknown: "I don't know",
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
  const { available: assistAvailable } = Route.useLoaderData();
  const [profile, setProfile] = useState<CopilotProfile>(() => loadProfile());
  const [situation, setSituation] = useState('');
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState('');
  const [assistOff, setAssistOff] = useState(!assistAvailable);

  const attached = useMemo(
    () => attachPlaybooks(profile, PLAYBOOKS),
    [profile]
  );
  const primaryId = primaryAttachedId(attached, profile);
  const primary = attached.find((pb) => pb.id === primaryId) ?? null;
  const others = attached.filter((pb) => pb.id !== primaryId);

  function commit(next: CopilotProfile) {
    const synced = syncDerivedBroken(next);
    saveProfile(synced);
    setProfile(synced);
    setError('');
  }

  function update(patch: Partial<CopilotProfile>) {
    commit({ ...profile, ...patch });
  }

  async function fillFromSentence() {
    const message = situation.trim();
    if (!message || assistOff) return;
    setFilling(true);
    setError('');
    try {
      const result = await fillIntakeProfileFn({ data: { message } });
      if (!result.available) {
        setAssistOff(true);
        return;
      }
      commit(applyIntakeFill(profile, result.fill));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that sentence.');
    } finally {
      setFilling(false);
    }
  }

  function diagnose() {
    if (!canStartPlaybook(profile)) {
      setError('Fill any three fields to start a playbook.');
      return;
    }
    router.push(primaryId ? `/run/${primaryId}` : '/library');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Intake</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Tell me which passport and what is stuck. I&apos;ll attach a playbook —
          this is not a chat with a travel writer.
        </p>
        {assistOff ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Live assist is off — tap the chips.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="intake-situation" className="sr-only">
          Situation
        </label>
        <Textarea
          id="intake-situation"
          rows={3}
          disabled={assistOff}
          placeholder="US passport, land tomorrow from HK, WeChat Pay dead"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void fillFromSentence();
            }
          }}
        />
        {!assistOff ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            disabled={filling || !situation.trim()}
            onClick={() => void fillFromSentence()}
          >
            {filling ? 'Reading…' : 'Fill profile from this'}
          </Button>
        ) : null}
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
        <h2 className="text-sm font-medium">WeChat Pay</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_STATES.map((state) => (
            <Chip
              key={state}
              active={profile.wechat_pay === state}
              onClick={() =>
                update({
                  wechat_pay: profile.wechat_pay === state ? '' : state,
                })
              }
            >
              {PAY_LABEL[state]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Alipay</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_STATES.map((state) => (
            <Chip
              key={state}
              active={profile.alipay === state}
              onClick={() =>
                update({ alipay: profile.alipay === state ? '' : state })
              }
            >
              {PAY_LABEL[state]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Mainland phone</h2>
        <div className="flex flex-wrap gap-2">
          {YES_NO_UNKNOWN.map((state) => (
            <Chip
              key={state}
              active={profile.has_cn_phone === state}
              onClick={() =>
                update({
                  has_cn_phone: profile.has_cn_phone === state ? '' : state,
                })
              }
            >
              {YES_NO_LABEL[state]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Mainland bank</h2>
        <div className="flex flex-wrap gap-2">
          {YES_NO_UNKNOWN.map((state) => (
            <Chip
              key={state}
              active={profile.has_cn_bank === state}
              onClick={() =>
                update({
                  has_cn_bank: profile.has_cn_bank === state ? '' : state,
                })
              }
            >
              {YES_NO_LABEL[state]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">What&apos;s broken</h2>
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
          className="h-11 w-full rounded-full border border-input bg-white px-4 text-sm"
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

      {primary ? (
        <div className="space-y-2 rounded-2xl border border-border bg-white/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recommended path
          </p>
          <p className="text-sm font-semibold">{primary.title_en}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {primary.id === 'pb-02'
              ? 'Accommodation registration is the diagnosis. One playbook — not a menu of equal choices.'
              : 'One recommended playbook from your chips. Open it and follow the current step.'}
          </p>
          {others.length ? (
            <p className="text-xs leading-5 text-muted-foreground">
              Later, not this pass:{' '}
              {others.map((pb, i) => (
                <span key={pb.id}>
                  {i > 0 ? ', ' : ''}
                  <Link href={`/run/${pb.id}`} className="underline underline-offset-4">
                    {pb.title_en}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No rule matched yet — you can still open the library.
        </p>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        className="h-12 w-full rounded-full"
        disabled={!canStartPlaybook(profile)}
        onClick={diagnose}
      >
        {primary?.id === 'pb-02'
          ? 'Start 24-hour registration'
          : primary
            ? `Start ${primary.title_en}`
            : 'Diagnose and open playbook'}
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/intake')({
  loader: async () => getIntakeAssistStatusFn(),
  component: IntakePage,
});
