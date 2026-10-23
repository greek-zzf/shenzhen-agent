import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, LifeBuoy } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Link, useRouter } from '@/core/i18n/navigation';
import { getPlaybook } from '@/lib/playbooks/catalog';
import { freshnessByUrl, type PlaybookFreshness } from '@/lib/playbooks/freshness';
import { STEP_CONFLICT_ID } from '@/lib/playbooks/labels';
import type { NiaEligibility } from '@/lib/playbooks/nia-eligibility';
import type { CopilotProfile } from '@/lib/playbooks/profile';
import {
  focusedClickPath,
  isSpecialRunCta,
  nextStepId,
  resolveActiveStepId,
  stepProgress,
  visiblePlaybookSteps,
} from '@/lib/playbooks/run-focus';
import {
  clearRunState,
  hasProgress,
  loadRunState,
  saveRunState,
} from '@/lib/playbooks/run-state';
import type { Playbook, PlaybookStep } from '@/lib/playbooks/schema';
import { cn } from '@/lib/utils';

import { AccommodationReminderOptIn } from './accommodation-reminder';
import { NiaEligibilityCard } from './nia-eligibility';
import { SourceStaleBadge } from './source-stale-badge';
import {
  ArrivalTimer,
  CitationFooter,
  ClickPathView,
  ConflictCallout,
  DisclaimerBanner,
  FailureTreeOverlay,
  GettingThereCard,
  PassportFailWarning,
  RequiredChecks,
  SpeechCardView,
  WhatToBring,
} from './slots';

function conflictForStep(playbook: Playbook, step: PlaybookStep) {
  const mapped = STEP_CONFLICT_ID[step.id];
  return (
    playbook.conflicts.find((c) => c.id === mapped || c.id === step.id) ??
    playbook.conflicts[0]
  );
}

function playbookTitle(id: string): string {
  return getPlaybook(id)?.title_en ?? id;
}

function StepSlots({
  playbook,
  step,
  profile,
  mode,
  checked,
  onToggle,
  niaEligibility,
  onArrivalChange,
}: {
  playbook: Playbook;
  step: PlaybookStep;
  profile: CopilotProfile;
  mode: 'public' | 'run';
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  niaEligibility: NiaEligibility | null;
  onArrivalChange?: (iso: string | null) => void;
}) {
  const clickPath =
    mode === 'run' ? focusedClickPath(step.click_path) : (step.click_path ?? null);

  return (
    <>
      <p className="text-sm leading-6 text-muted-foreground">{step.why}</p>

      {step.passport_fail_warning ? (
        <PassportFailWarning warning={step.passport_fail_warning} />
      ) : null}

      {step.slot === 'getting_there' && step.getting_there ? (
        <GettingThereCard data={step.getting_there} />
      ) : null}

      {step.what_to_bring.length ? (
        <WhatToBring items={step.what_to_bring} checked={checked} onToggle={onToggle} />
      ) : null}

      {step.speech_card ? <SpeechCardView card={step.speech_card} /> : null}

      {clickPath ? (
        <div className="space-y-2">
          {mode === 'run' ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tap in this order
            </p>
          ) : null}
          <ClickPathView path={clickPath} />
        </div>
      ) : null}

      {step.id === 'nia-list' && niaEligibility ? (
        <NiaEligibilityCard eligibility={niaEligibility} />
      ) : null}

      {step.slot === 'conflict' ? (
        <ConflictCallout conflict={conflictForStep(playbook, step)} />
      ) : null}

      {step.timer ? (
        <ArrivalTimer
          arrivalAt={profile.arrival_at}
          label={step.timer.label_en}
          onArrivalChange={onArrivalChange}
        />
      ) : null}

      {mode === 'run' && step.id === 'email-nudge' ? (
        <AccommodationReminderOptIn
          arrivalAt={profile.arrival_at}
          stayType={profile.stay_type}
        />
      ) : null}

      {step.required_checkboxes.length ? (
        <RequiredChecks
          items={step.required_checkboxes}
          checked={checked}
          onToggle={onToggle}
        />
      ) : null}
    </>
  );
}

function RunProgress({
  steps,
  activeStepId,
  done,
  expanded,
  onToggleExpanded,
  onSelect,
}: {
  steps: PlaybookStep[];
  activeStepId: string;
  done: Record<string, boolean>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (id: string) => void;
}) {
  const progress = stepProgress(steps, activeStepId);
  const doneCount = steps.filter((step) => done[step.id]).length;
  const percent = progress.total === 0 ? 0 : Math.round((doneCount / progress.total) * 100);

  return (
    <section className="rounded-2xl bg-white/80 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tabular-nums">
          {progress.label}
          <span className="ml-2 font-normal text-muted-foreground">
            {doneCount} done
          </span>
        </p>
        <button
          type="button"
          className="-my-2 min-h-11 px-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          {expanded ? 'Hide steps' : 'All steps'}
        </button>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--lawn-cream)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.total || 1}
        aria-valuenow={doneCount}
        aria-label={`${doneCount} of ${progress.total} steps done`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {expanded ? (
        <ol className="mt-3 space-y-1">
          {steps.map((step, index) => {
            const current = step.id === activeStepId;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={cn(
                    'flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm',
                    current ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60'
                  )}
                  onClick={() => onSelect(step.id)}
                >
                  <span className="w-6 tabular-nums text-xs">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{step.title_en}</span>
                  {done[step.id] ? (
                    <Check className="size-4 text-foreground" aria-label="done" />
                  ) : current ? (
                    <span className="text-[11px] text-muted-foreground">now</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

function RelatedPlaybooks({
  ids,
  mode,
  heading,
}: {
  ids: string[];
  mode: 'public' | 'run';
  heading: string;
}) {
  if (!ids.length) return null;
  return (
    <section className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {heading}
      </p>
      <ul className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <li key={id}>
            <Link
              href={mode === 'public' ? `/login?next=/run/${id}` : `/run/${id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-medium shadow-[0_4px_12px_rgba(47,49,48,0.06)]"
            >
              {playbookTitle(id)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlaybookView({
  playbook,
  profile,
  mode,
  attachedIds = [],
  loginNext,
  freshness,
  niaEligibility = null,
  onProfileChange,
}: {
  playbook: Playbook;
  profile: CopilotProfile;
  mode: 'public' | 'run';
  attachedIds?: string[];
  loginNext?: string;
  freshness?: PlaybookFreshness | null;
  niaEligibility?: NiaEligibility | null;
  onProfileChange?: (next: CopilotProfile) => void;
}) {
  const router = useRouter();
  const [stuckOpen, setStuckOpen] = useState(false);
  const [stuckNode, setStuckNode] = useState<string | undefined>(undefined);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(
    playbook.steps[0]?.id ?? playbook.id
  );
  const [resumed, setResumed] = useState(false);
  const [restored, setRestored] = useState(false);
  const scrollOnChangeRef = useRef(false);
  const stepRef = useRef<HTMLElement>(null);

  const visibleSteps = useMemo(
    () => visiblePlaybookSteps(playbook, profile, mode),
    [playbook, profile, mode]
  );
  const activeStepId = resolveActiveStepId(
    visibleSteps,
    currentStepId,
    playbook.steps[0]?.id ?? playbook.id
  );
  const activeStep =
    visibleSteps.find((step) => step.id === activeStepId) ?? visibleSteps[0];
  const activeIndex = activeStep
    ? visibleSteps.findIndex((step) => step.id === activeStep.id)
    : -1;
  const nextId = activeStep ? nextStepId(visibleSteps, activeStep.id) : null;
  const finished = Boolean(activeStep && done[activeStep.id] && !nextId);

  const others = attachedIds.filter((id) => id !== playbook.id);
  const related = [
    ...others,
    ...playbook.attached_playbooks.filter(
      (id) => id !== playbook.id && !others.includes(id)
    ),
  ];

  // Restore progress after mount (localStorage is client-only).
  useEffect(() => {
    if (mode !== 'run') return;
    const saved = loadRunState(playbook.id);
    if (saved.currentStepId) setCurrentStepId(saved.currentStepId);
    setDone(saved.done);
    setChecked(saved.checked);
    setResumed(hasProgress(saved));
    setRestored(true);
  }, [mode, playbook.id]);

  // Only write once the restored values have rendered, so a save can never
  // overwrite stored progress with the initial empty state.
  useEffect(() => {
    if (mode !== 'run' || !restored) return;
    saveRunState(playbook.id, {
      currentStepId,
      done,
      checked,
      updatedAt: null,
    });
  }, [mode, restored, playbook.id, currentStepId, done, checked]);

  // Bring the new step's title into view after Next / Back / jump.
  useEffect(() => {
    if (!scrollOnChangeRef.current) return;
    scrollOnChangeRef.current = false;
    stepRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [activeStepId]);

  function goTo(id: string) {
    scrollOnChangeRef.current = true;
    setCurrentStepId(id);
  }

  function toggleCheck(id: string, value: boolean) {
    setChecked((prev) => ({ ...prev, [id]: value }));
  }

  function runSpecialCta(step: PlaybookStep) {
    if (step.primary_cta.id === 'preview_hr_letter') {
      router.push('/run/pb-10/hr-letter');
      return;
    }
    if (step.primary_cta.id === 'open_official') {
      const url = step.official_urls[0]?.url ?? playbook.official_urls[0]?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function goNext(step: PlaybookStep) {
    if (mode !== 'run') return;
    if (isSpecialRunCta(step.primary_cta.id)) {
      runSpecialCta(step);
    }
    setDone((prev) => ({ ...prev, [step.id]: true }));
    const upcoming = nextStepId(visibleSteps, step.id);
    if (upcoming) goTo(upcoming);
  }

  function goBack() {
    const prev = visibleSteps[activeIndex - 1];
    if (prev) goTo(prev.id);
  }

  function startOver() {
    clearRunState(playbook.id);
    setDone({});
    setChecked({});
    setResumed(false);
    goTo(visibleSteps[0]?.id ?? playbook.id);
  }

  function openStuck(step?: PlaybookStep) {
    setStuckNode(step?.stuck_node ?? undefined);
    setStuckOpen(true);
  }

  function setArrival(iso: string | null) {
    onProfileChange?.({ ...profile, arrival_at: iso });
  }

  const header = (
    <header className="space-y-2">
      <SourceStaleBadge lastVerified={playbook.last_verified} />
      <h1 className="text-2xl font-semibold tracking-tight [text-wrap:balance]">
        {playbook.title_en}
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">{playbook.summary_en}</p>
    </header>
  );

  const footer = (
    <>
      <DisclaimerBanner text={playbook.disclaimer_en} />
      <CitationFooter
        urls={playbook.official_urls}
        lastVerified={playbook.last_verified}
        freshnessByUrl={freshnessByUrl(freshness)}
      />
    </>
  );

  const loginHref = `/login?next=${encodeURIComponent(loginNext ?? `/run/${playbook.id}`)}`;

  if (mode !== 'run') {
    return (
      <article className="space-y-6">
        {header}
        <Link
          href={loginHref}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          Run this step by step
        </Link>
        <ol className="space-y-8">
          {visibleSteps.map((step, index) => (
            <li key={step.id} id={step.id} className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {index + 1}/{visibleSteps.length}
                </span>
                <h2 className="text-lg font-semibold">{step.title_en}</h2>
              </div>
              <StepSlots
                playbook={playbook}
                step={step}
                profile={profile}
                mode="public"
                checked={checked}
                onToggle={toggleCheck}
                niaEligibility={niaEligibility}
              />
            </li>
          ))}
        </ol>
        <Link
          href={loginHref}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          Run this step by step
        </Link>
        <RelatedPlaybooks ids={related} mode="public" heading="Related" />
        {footer}
      </article>
    );
  }

  if (!activeStep) return null;

  const nextPlaybookId = others[0] ?? playbook.attached_playbooks[0] ?? null;

  return (
    <article className="space-y-5">
      {header}

      {resumed ? (
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          Picked up where you left off.
          <button
            type="button"
            className="min-h-11 font-medium text-foreground underline underline-offset-4"
            onClick={startOver}
          >
            Start over
          </button>
        </p>
      ) : null}

      <RunProgress
        steps={visibleSteps}
        activeStepId={activeStep.id}
        done={done}
        expanded={stepsExpanded}
        onToggleExpanded={() => setStepsExpanded((open) => !open)}
        onSelect={(id) => {
          setStepsExpanded(false);
          goTo(id);
        }}
      />

      <section
        ref={stepRef}
        id={activeStep.id}
        aria-live="polite"
        className="scroll-mt-4 space-y-4 rounded-2xl bg-white px-4 pt-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]"
      >
        <h2 className="text-lg font-semibold [text-wrap:balance]">{activeStep.title_en}</h2>
        <StepSlots
          playbook={playbook}
          step={activeStep}
          profile={profile}
          mode="run"
          checked={checked}
          onToggle={toggleCheck}
          niaEligibility={niaEligibility}
          onArrivalChange={onProfileChange ? setArrival : undefined}
        />

        {finished ? (
          <div className="space-y-1 rounded-xl bg-[var(--lawn-cream)] px-4 py-3">
            <p className="text-sm font-semibold">That was the last step.</p>
            <p className="text-sm leading-6 text-muted-foreground">
              This guide is still a draft — if the window says otherwise, follow
              the window.
            </p>
            {nextPlaybookId ? (
              <p className="pt-1 text-sm">
                Next up for you:{' '}
                <span className="font-semibold">{playbookTitle(nextPlaybookId)}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-2 rounded-b-2xl bg-white/95 px-4 pb-4 pt-3 backdrop-blur-sm [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="size-12 shrink-0 rounded-full"
            disabled={activeIndex <= 0}
            aria-label="Previous step"
            onClick={goBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
          {finished ? (
            nextPlaybookId ? (
              <Link
                href={`/run/${nextPlaybookId}`}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 min-w-0 flex-1 rounded-full'
                )}
              >
                Next guide
              </Link>
            ) : (
              <Link
                href="/library"
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 flex-1 rounded-full')}
              >
                Back to library
              </Link>
            )
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-12 flex-1 rounded-full"
              onClick={() => goNext(activeStep)}
            >
              {nextId ? 'Done, next step' : 'Finish'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="h-12 shrink-0 rounded-full px-4"
            onClick={() => openStuck(activeStep)}
          >
            <LifeBuoy className="size-4" />
            I&apos;m stuck
          </Button>
        </div>
      </section>

      <RelatedPlaybooks ids={related} mode="run" heading="Also for your situation" />

      {footer}

      <FailureTreeOverlay
        tree={playbook.failure_tree}
        startNodeId={stuckNode}
        open={stuckOpen}
        onOpenChange={setStuckOpen}
      />
    </article>
  );
}
