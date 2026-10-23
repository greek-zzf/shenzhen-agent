import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Link, useRouter } from '@/core/i18n/navigation';
import {
  attachPlaybooks,
  isAccommodationSituation,
  primaryAttachedId,
} from '@/lib/playbooks/attach';
import { PLAYBOOKS } from '@/lib/playbooks/catalog';
import { syncDerivedBroken } from '@/lib/playbooks/intake-fill';
import {
  BROKEN_OPTIONS,
  COUNTRY_CHIPS,
  canStartPlaybook,
  DISTRICTS,
  filledIntakeCount,
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
import { isoToLocalInput, localInputToIso } from '@/lib/playbooks/run-state';
import type { Playbook } from '@/lib/playbooks/schema';
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

const NEEDED = 3;

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
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-full border px-4 py-2 text-sm transition-colors duration-150',
        active
          ? 'border-foreground bg-primary text-primary-foreground'
          : 'border-border bg-white hover:border-foreground/40'
      )}
    >
      {children}
    </button>
  );
}

function Question({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">
          <span className="mr-2 tabular-nums text-muted-foreground">{n}</span>
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}

/** Plain-language reason the recommended playbook leads, built from the user's own answers. */
function recommendReason(primary: Playbook, profile: CopilotProfile): string {
  if (primary.id === 'pb-02' && isAccommodationSituation(profile)) {
    const paysToo = profile.broken.filter((f) => f !== 'need_24h').length > 0;
    const lead =
      profile.stay_type === 'apartment'
        ? "You're not in a hotel, so you have to register within 24 hours of arriving. That's a legal deadline, so it goes first."
        : 'The 24-hour registration has a legal deadline, so it goes first.';
    return paysToo ? `${lead} Your other problems are right after it.` : lead;
  }
  const reasons: string[] = [];
  for (const rule of primary.attach_when) {
    if (rule.when === 'broken_contains' && profile.broken.includes(rule.value as BrokenFlag)) {
      reasons.push(`you said "${BROKEN_LABEL[rule.value as BrokenFlag]}"`);
    } else if (rule.when === 'visa_type_in' && profile.visa_type === rule.value) {
      reasons.push('you picked the 5-day VOA');
    } else if (rule.when === 'location_is' && profile.location === rule.value) {
      reasons.push("you're in Hong Kong without a visa");
    }
  }
  return reasons.length
    ? `Because ${reasons.slice(0, 2).join(' and ')}.`
    : 'This matches the answers above.';
}

function IntakePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CopilotProfile>(() => loadProfile());

  const attached = useMemo(() => attachPlaybooks(profile, PLAYBOOKS), [profile]);
  const primaryId = primaryAttachedId(attached, profile);
  const primary = attached.find((pb) => pb.id === primaryId) ?? null;
  const others = attached.filter((pb) => pb.id !== primaryId).slice(0, 3);
  const filled = filledIntakeCount(profile);
  const ready = canStartPlaybook(profile);

  function update(patch: Partial<CopilotProfile>) {
    const synced = syncDerivedBroken({ ...profile, ...patch });
    saveProfile(synced);
    setProfile(synced);
  }

  function toggle<K extends keyof CopilotProfile>(key: K, value: CopilotProfile[K]) {
    update({ [key]: profile[key] === value ? '' : value } as Partial<CopilotProfile>);
  }

  function start() {
    if (!ready) return;
    router.push(primaryId ? `/run/${primaryId}` : '/library');
  }

  const optionalCount = [
    profile.district,
    profile.wechat_pay,
    profile.alipay,
    profile.has_cn_phone,
    profile.has_cn_bank,
    profile.arrival_at,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">What&apos;s going on?</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Three quick answers and we&apos;ll open the right guide. Your answers stay
          on this phone.
        </p>
      </div>

      <Question n={1} title="What's stuck right now?" hint="Pick everything that applies.">
        <div className="flex flex-wrap gap-2">
          {BROKEN_OPTIONS.map((flag) => (
            <Chip
              key={flag}
              active={profile.broken.includes(flag)}
              onClick={() =>
                update({
                  broken: profile.broken.includes(flag)
                    ? profile.broken.filter((x) => x !== flag)
                    : [...profile.broken, flag],
                })
              }
            >
              {BROKEN_LABEL[flag]}
            </Chip>
          ))}
        </div>
      </Question>

      <Question n={2} title="Where are you, and where are you sleeping?">
        <div className="space-y-2">
          <SubLabel>Right now</SubLabel>
          <div className="flex flex-wrap gap-2">
            <Chip
              active={profile.location === 'hk_no_visa'}
              onClick={() => toggle('location', 'hk_no_visa')}
            >
              In HK without a visa
            </Chip>
            <Chip
              active={profile.location === 'already_in_shenzhen'}
              onClick={() => toggle('location', 'already_in_shenzhen')}
            >
              Already in Shenzhen
            </Chip>
          </div>
        </div>
        <div className="space-y-2">
          <SubLabel>Sleeping at</SubLabel>
          <div className="flex flex-wrap gap-2">
            {STAY_TYPES.map((s) => (
              <Chip key={s} active={profile.stay_type === s} onClick={() => toggle('stay_type', s)}>
                {STAY_LABEL[s]}
              </Chip>
            ))}
          </div>
        </div>
      </Question>

      <Question n={3} title="Passport and visa">
        <div className="space-y-2">
          <SubLabel>Passport</SubLabel>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_CHIPS.map((c) => (
              <Chip
                key={c}
                active={profile.passport_country === c}
                onClick={() => toggle('passport_country', c)}
              >
                {c === 'unknown' ? 'Other' : c}
              </Chip>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <SubLabel>Visa</SubLabel>
          <div className="flex flex-wrap gap-2">
            {VISA_TYPES.map((v) => (
              <Chip key={v} active={profile.visa_type === v} onClick={() => toggle('visa_type', v)}>
                {VISA_LABEL[v]}
              </Chip>
            ))}
          </div>
        </div>
      </Question>

      <details className="group rounded-2xl bg-white/70 px-4">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span>
            More details{' '}
            <span className="font-normal text-muted-foreground">
              — optional{optionalCount ? ` · ${optionalCount} added` : ''}
            </span>
          </span>
          <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="space-y-5 pb-5 pt-1">
          <label className="block space-y-2">
            <SubLabel>Arrival time (starts the 24-hour clock)</SubLabel>
            <input
              type="datetime-local"
              className="h-11 w-full rounded-full border border-input bg-white px-4 text-sm"
              value={isoToLocalInput(profile.arrival_at)}
              onChange={(e) => update({ arrival_at: localInputToIso(e.target.value) })}
            />
          </label>
          <div className="space-y-2">
            <SubLabel>District</SubLabel>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <Chip key={d} active={profile.district === d} onClick={() => toggle('district', d)}>
                  {DISTRICT_LABEL[d]}
                </Chip>
              ))}
            </div>
          </div>
          {(
            [
              ['wechat_pay', 'WeChat Pay', PAY_STATES, PAY_LABEL],
              ['alipay', 'Alipay', PAY_STATES, PAY_LABEL],
              ['has_cn_phone', 'Mainland phone number', YES_NO_UNKNOWN, YES_NO_LABEL],
              ['has_cn_bank', 'Mainland bank account', YES_NO_UNKNOWN, YES_NO_LABEL],
            ] as const
          ).map(([key, label, values, labels]) => (
            <div key={key} className="space-y-2">
              <SubLabel>{label}</SubLabel>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <Chip
                    key={value}
                    active={profile[key] === value}
                    onClick={() => toggle(key, value)}
                  >
                    {(labels as Record<string, string>)[value]}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {ready && primary ? (
        <section className="space-y-3 rounded-[1.75rem] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
          <div>
            <p className="text-sm text-muted-foreground">Start with</p>
            <p className="text-lg font-semibold">{primary.title_en}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {recommendReason(primary, profile)}
            </p>
          </div>
          {others.length ? (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground">Or start with</p>
              <div className="flex flex-wrap gap-2">
                {others.map((pb) => (
                  <Link
                    key={pb.id}
                    href={`/run/${pb.id}`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'h-11 rounded-full px-4'
                    )}
                  >
                    {pb.title_en}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : ready ? (
        <p className="text-sm text-muted-foreground">
          Nothing matched those answers yet.{' '}
          <Link href="/library" className="font-medium text-foreground underline underline-offset-4">
            Browse all guides
          </Link>
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 bg-[var(--lawn-cream)]/95 px-4 pb-4 pt-3 backdrop-blur-sm [padding-bottom:max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <Button
          type="button"
          className="h-12 w-full rounded-full"
          disabled={!ready}
          onClick={start}
        >
          {!ready
            ? `Answer ${NEEDED - filled} more to continue`
            : primary
              ? `Start: ${primary.title_en}`
              : 'Browse all guides'}
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/intake')({
  component: IntakePage,
});
