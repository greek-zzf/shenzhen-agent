/**
 * Per-playbook run progress, kept on this device so a reload, a lock screen,
 * or a switch to Alipay at the counter does not throw the user back to step 1.
 */
export const RUN_STATE_PREFIX = 'sz-copilot-run:';

export type RunState = {
  currentStepId: string | null;
  done: Record<string, boolean>;
  checked: Record<string, boolean>;
  updatedAt: string | null;
};

export const EMPTY_RUN_STATE: RunState = {
  currentStepId: null,
  done: {},
  checked: {},
  updatedAt: null,
};

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function asFlags(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, boolean> = {};
  for (const [key, flag] of Object.entries(value as Record<string, unknown>)) {
    if (flag === true) out[key] = true;
  }
  return out;
}

export function loadRunState(playbookId: string): RunState {
  const store = storage();
  if (!store) return { ...EMPTY_RUN_STATE };
  try {
    const raw = store.getItem(RUN_STATE_PREFIX + playbookId);
    if (!raw) return { ...EMPTY_RUN_STATE };
    const parsed = JSON.parse(raw) as Partial<RunState>;
    return {
      currentStepId:
        typeof parsed.currentStepId === 'string' ? parsed.currentStepId : null,
      done: asFlags(parsed.done),
      checked: asFlags(parsed.checked),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return { ...EMPTY_RUN_STATE };
  }
}

export function saveRunState(playbookId: string, state: RunState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(
      RUN_STATE_PREFIX + playbookId,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() })
    );
  } catch {
    // Storage full or blocked: progress just won't survive a reload.
  }
}

export function clearRunState(playbookId: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(RUN_STATE_PREFIX + playbookId);
  } catch {
    // ignore
  }
}

export function hasProgress(state: RunState): boolean {
  return (
    Object.keys(state.done).length > 0 ||
    Object.values(state.checked).some(Boolean)
  );
}

/** `datetime-local` wants local wall-clock time, not the UTC slice of an ISO string. */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
