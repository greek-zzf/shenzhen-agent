import { shouldSkipStep } from './attach';
import type { CopilotProfile } from './profile';
import type { Playbook, PlaybookStep } from './schema';

export const RUN_FRAMING =
  'This is an execution playbook — not a chatbot. Follow the current step at the window. Ask only answers this step from the SOP.';

export const MAX_FOCUSED_CLICK_PATH_SCREENS = 3;

export function visiblePlaybookSteps(
  playbook: Playbook,
  profile: CopilotProfile,
  mode: 'public' | 'run'
): PlaybookStep[] {
  return playbook.steps.filter((step) => !shouldSkipStep(step, profile, mode));
}

export function resolveActiveStepId(
  steps: PlaybookStep[],
  currentStepId: string | undefined,
  fallbackId: string
): string {
  if (currentStepId && steps.some((step) => step.id === currentStepId)) {
    return currentStepId;
  }
  return steps[0]?.id ?? fallbackId;
}

export function stepProgress(
  steps: PlaybookStep[],
  currentStepId: string
): { index: number; total: number; label: string } {
  const index = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId)
  );
  const total = steps.length;
  return {
    index,
    total,
    label: total === 0 ? 'Step 0 of 0' : `Step ${index + 1} of ${total}`,
  };
}

export function nextStepId(
  steps: PlaybookStep[],
  currentStepId: string
): string | null {
  const index = steps.findIndex((step) => step.id === currentStepId);
  if (index < 0) return steps[0]?.id ?? null;
  return steps[index + 1]?.id ?? null;
}

export function focusedClickPath(
  path: NonNullable<PlaybookStep['click_path']> | null | undefined
): NonNullable<PlaybookStep['click_path']> | null {
  if (!path?.steps.length) return null;
  return {
    ...path,
    steps: path.steps.slice(0, MAX_FOCUSED_CLICK_PATH_SCREENS),
  };
}

export function isSpecialRunCta(ctaId: PlaybookStep['primary_cta']['id']): boolean {
  return ctaId === 'preview_hr_letter' || ctaId === 'open_official';
}
