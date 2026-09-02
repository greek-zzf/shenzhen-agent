import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/core/i18n/navigation';
import { shouldSkipStep } from '@/lib/playbooks/attach';
import { freshnessByUrl, type PlaybookFreshness } from '@/lib/playbooks/freshness';
import { STEP_CONFLICT_ID } from '@/lib/playbooks/labels';
import type { CopilotProfile } from '@/lib/playbooks/profile';
import type { Playbook, PlaybookStep } from '@/lib/playbooks/schema';

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

export function PlaybookView({
  playbook,
  profile,
  mode,
  attachedIds = [],
  loginNext,
  freshness,
}: {
  playbook: Playbook;
  profile: CopilotProfile;
  mode: 'public' | 'run';
  attachedIds?: string[];
  loginNext?: string;
  freshness?: PlaybookFreshness | null;
}) {
  const router = useRouter();
  const [stuckOpen, setStuckOpen] = useState(false);
  const [stuckNode, setStuckNode] = useState<string | undefined>(
    playbook.failure_tree.nodes[0]?.id
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const visibleSteps = useMemo(
    () => playbook.steps.filter((step) => !shouldSkipStep(step, profile, mode)),
    [playbook.steps, profile, mode]
  );

  const others = attachedIds.filter((id) => id !== playbook.id);

  function toggleCheck(id: string, value: boolean) {
    setChecked((prev) => ({ ...prev, [id]: value }));
  }

  function stepReady(step: PlaybookStep): boolean {
    const required = [
      ...step.required_checkboxes.map((c) => c.id),
      ...step.what_to_bring.filter((item) => item.required).map((item) => item.id),
    ];
    return required.every((id) => checked[id]);
  }

  function runPrimary(step: PlaybookStep) {
    if (mode === 'public') return;
    if (!stepReady(step)) return;
    if (step.primary_cta.id === 'preview_hr_letter') {
      router.push('/run/pb-10/hr-letter');
      return;
    }
    if (step.primary_cta.id === 'open_official') {
      const url = step.official_urls[0]?.url ?? playbook.official_urls[0]?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
    setDone((prev) => ({ ...prev, [step.id]: true }));
  }

  return (
    <article className="space-y-6">
      <DisclaimerBanner text={playbook.disclaimer_en} />

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <SourceStaleBadge lastVerified={playbook.last_verified} />
          <span className="text-xs text-muted-foreground">{playbook.id}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{playbook.title_en}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{playbook.summary_en}</p>
      </header>

      {mode === 'public' ? (
        <Link
          href={`/login?next=${encodeURIComponent(loginNext ?? `/run/${playbook.id}`)}`}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
        >
          Run this with my passport
        </Link>
      ) : null}

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

      <ol className="space-y-8">
        {visibleSteps.map((step, index) => (
          <li key={step.id} id={step.id} className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {index + 1}/{visibleSteps.length}
              </span>
              <h2 className="text-lg font-semibold">{step.title_en}</h2>
            </div>
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
                onToggle={toggleCheck}
              />
            ) : null}

            {step.slot === 'speech' && step.speech_card ? (
              <SpeechCardView card={step.speech_card} />
            ) : null}
            {step.slot !== 'speech' && step.speech_card ? (
              <SpeechCardView card={step.speech_card} />
            ) : null}

            {step.slot === 'click_path' && step.click_path ? (
              <ClickPathView path={step.click_path} />
            ) : null}

            {step.slot === 'conflict' ? (
              <ConflictCallout conflict={conflictForStep(playbook, step)} />
            ) : null}

            {step.timer ? (
              <ArrivalTimer
                arrivalAt={profile.arrival_at}
                label={step.timer.label_en}
              />
            ) : null}

            {step.required_checkboxes.length ? (
              <RequiredChecks
                items={step.required_checkboxes}
                checked={checked}
                onToggle={toggleCheck}
              />
            ) : null}

            {mode === 'run' ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full"
                  disabled={!stepReady(step) || done[step.id]}
                  onClick={() => runPrimary(step)}
                >
                  {done[step.id] ? 'Done' : step.primary_cta.label_en}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => {
                    setStuckNode(step.stuck_node);
                    setStuckOpen(true);
                  }}
                >
                  I'm stuck
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      {mode === 'run' ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => {
            setStuckNode(playbook.failure_tree.nodes[0]?.id);
            setStuckOpen(true);
          }}
        >
          I'm stuck
        </Button>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(loginNext ?? `/run/${playbook.id}`)}`}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
        >
          Run this with my passport
        </Link>
      )}

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
  );
}
