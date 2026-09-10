import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/core/i18n/navigation';
import { freshnessByUrl, type PlaybookFreshness } from '@/lib/playbooks/freshness';
import { STEP_CONFLICT_ID } from '@/lib/playbooks/labels';
import type { NiaEligibility } from '@/lib/playbooks/nia-eligibility';
import type { CopilotProfile } from '@/lib/playbooks/profile';
import {
  RUN_FRAMING,
  focusedClickPath,
  isSpecialRunCta,
  nextStepId,
  resolveActiveStepId,
  stepProgress,
  visiblePlaybookSteps,
} from '@/lib/playbooks/run-focus';
import type { Playbook, PlaybookStep } from '@/lib/playbooks/schema';
import { cn } from '@/lib/utils';

import { AccommodationReminderOptIn } from './accommodation-reminder';
import { NiaEligibilityCard } from './nia-eligibility';
import { PlaybookHelp, PlaybookHelpTrigger } from './playbook-help';
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

function StepSlots({
  playbook,
  step,
  profile,
  mode,
  checked,
  onToggle,
  niaEligibility,
}: {
  playbook: Playbook;
  step: PlaybookStep;
  profile: CopilotProfile;
  mode: 'public' | 'run';
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  niaEligibility: NiaEligibility | null;
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
        <WhatToBring
          items={step.what_to_bring}
          checked={checked}
          onToggle={onToggle}
          interactive={mode === 'public'}
        />
      ) : null}

      {step.speech_card ? <SpeechCardView card={step.speech_card} /> : null}

      {clickPath ? (
        <div className="space-y-2">
          {mode === 'run' ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Click path
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
        <ArrivalTimer arrivalAt={profile.arrival_at} label={step.timer.label_en} />
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
          interactive={mode === 'public'}
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
  const percent =
    progress.total === 0 ? 0 : Math.round(((progress.index + 1) / progress.total) * 100);

  return (
    <section className="rounded-2xl border border-border bg-white/80 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tabular-nums">{progress.label}</p>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          {expanded ? 'Hide steps' : 'All steps'}
        </button>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={progress.total || 1}
        aria-valuenow={progress.index + 1}
        aria-label={progress.label}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
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
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm',
                    current ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60'
                  )}
                  onClick={() => onSelect(step.id)}
                >
                  <span className="w-6 tabular-nums text-xs">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{step.title_en}</span>
                  {done[step.id] ? (
                    <span className="text-[11px] text-muted-foreground">done</span>
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

export function PlaybookView({
  playbook,
  profile,
  mode,
  attachedIds = [],
  loginNext,
  freshness,
  assistAvailable = false,
  niaEligibility = null,
}: {
  playbook: Playbook;
  profile: CopilotProfile;
  mode: 'public' | 'run';
  attachedIds?: string[];
  loginNext?: string;
  freshness?: PlaybookFreshness | null;
  assistAvailable?: boolean;
  niaEligibility?: NiaEligibility | null;
}) {
  const router = useRouter();
  const [stuckOpen, setStuckOpen] = useState(false);
  const [stuckNode, setStuckNode] = useState<string | undefined>(
    playbook.failure_tree.nodes[0]?.id
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(
    playbook.steps[0]?.id ?? playbook.id
  );

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
  const nextId = activeStep ? nextStepId(visibleSteps, activeStep.id) : null;
  const finished = Boolean(activeStep && done[activeStep.id] && !nextId);

  const others = attachedIds.filter((id) => id !== playbook.id);

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
    if (upcoming) setCurrentStepId(upcoming);
  }

  function openStuck(step?: PlaybookStep) {
    setStuckNode(step?.stuck_node ?? playbook.failure_tree.nodes[0]?.id);
    setStuckOpen(true);
    setHelpOpen(true);
  }

  const header = (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <SourceStaleBadge lastVerified={playbook.last_verified} />
        <span className="text-xs text-muted-foreground">{playbook.id}</span>
        {mode === 'run' ? (
          <PlaybookHelpTrigger
            onClick={() => {
              setHelpOpen(true);
            }}
          />
        ) : null}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{playbook.title_en}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{playbook.summary_en}</p>
      {mode === 'run' ? (
        <p className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm leading-6">
          {RUN_FRAMING}
        </p>
      ) : null}
    </header>
  );

  const linked = (
    <>
      {mode === 'run' && others.length ? (
        <p className="text-sm text-muted-foreground">
          Also attached:{' '}
          {others.map((id, i) => (
            <span key={id}>
              {i > 0 ? ', ' : ''}
              <Link href={`/run/${id}`} className="underline underline-offset-4">
                {id}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      {playbook.attached_playbooks.length ? (
        <p className="text-sm">
          Linked playbook:{' '}
          {playbook.attached_playbooks.map((id) => (
            <Link
              key={id}
              href={mode === 'public' ? `/login?next=/run/${id}` : `/run/${id}`}
              className="underline underline-offset-4"
            >
              {id}
            </Link>
          ))}
        </p>
      ) : null}
    </>
  );

  const publicBody = (
    <article className="space-y-6">
      <DisclaimerBanner text={playbook.disclaimer_en} />
      {header}
      <Link
        href={`/login?next=${encodeURIComponent(loginNext ?? `/run/${playbook.id}`)}`}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
      >
        Run this with my passport
      </Link>
      {linked}
      <ol className="space-y-8">
        {visibleSteps.map((step, index) => (
          <li key={step.id} id={step.id} className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-muted-foreground">
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
        href={`/login?next=${encodeURIComponent(loginNext ?? `/run/${playbook.id}`)}`}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
      >
        Run this with my passport
      </Link>
      <CitationFooter
        urls={playbook.official_urls}
        lastVerified={playbook.last_verified}
        freshnessByUrl={freshnessByUrl(freshness)}
      />
    </article>
  );

  const runBody = activeStep ? (
    <article className="space-y-6">
      <DisclaimerBanner text={playbook.disclaimer_en} />
      {header}
      {linked}

      <RunProgress
        steps={visibleSteps}
        activeStepId={activeStep.id}
        done={done}
        expanded={stepsExpanded}
        onToggleExpanded={() => setStepsExpanded((open) => !open)}
        onSelect={(id) => {
          setCurrentStepId(id);
          setStepsExpanded(false);
        }}
      />

      <section
        id={activeStep.id}
        className="space-y-4 rounded-2xl border border-border bg-white px-4 py-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]"
      >
        <h2 className="text-lg font-semibold">{activeStep.title_en}</h2>
        <StepSlots
          playbook={playbook}
          step={activeStep}
          profile={profile}
          mode="run"
          checked={checked}
          onToggle={toggleCheck}
          niaEligibility={niaEligibility}
        />

        {finished ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6">
            Last step on this playbook. Confirm at the window — this SOP is still
            draft.
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-full"
            disabled={finished}
            onClick={() => goNext(activeStep)}
          >
            {finished ? 'Done' : nextId ? 'Next' : 'Finish'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={() => openStuck(activeStep)}
          >
            I&apos;m stuck
          </Button>
          <button
            type="button"
            className="self-center text-xs text-muted-foreground underline-offset-4 hover:underline lg:hidden"
            onClick={() => {
              setCurrentStepId(activeStep.id);
              setHelpOpen(true);
            }}
          >
            Ask this step
          </button>
        </div>
      </section>

      <CitationFooter
        urls={playbook.official_urls}
        lastVerified={playbook.last_verified}
        freshnessByUrl={freshnessByUrl(freshness)}
      />

      <FailureTreeOverlay
        tree={playbook.failure_tree}
        startNodeId={stuckNode}
        open={stuckOpen}
        onOpenChange={setStuckOpen}
      />
    </article>
  ) : null;

  if (mode !== 'run') return publicBody;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
      {runBody}
      <PlaybookHelp
        playbook={playbook}
        profile={profile}
        currentStepId={activeStepId}
        available={assistAvailable}
        mobileOpen={helpOpen}
        onMobileOpenChange={setHelpOpen}
        onOpenFailureNode={(nodeId) => {
          setStuckNode(nodeId);
          setStuckOpen(true);
        }}
      />
    </div>
  );
}
