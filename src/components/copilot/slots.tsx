import { useEffect, useState } from 'react';
import { ChevronRight, Copy, Maximize2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  formatOfficialFetchedAt,
  type UrlFreshness,
} from '@/lib/playbooks/freshness';
import { sourceKindLabel } from '@/lib/playbooks/labels';
import { isoToLocalInput, localInputToIso } from '@/lib/playbooks/run-state';
import type {
  Conflict,
  FailureTree,
  GettingThere,
  OfficialUrl,
  PlaybookStep,
  SpeechCard,
} from '@/lib/playbooks/schema';

export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs leading-5 text-foreground">
      {text}
    </p>
  );
}

function SourceFetchStatus({ status }: { status?: UrlFreshness }) {
  if (!status) return null;
  if (status.status === 'ok' && status.fetched_at) {
    return (
      <p className="mt-1 text-[11px] text-muted-foreground">
        official page fetched {formatOfficialFetchedAt(status.fetched_at)}
      </p>
    );
  }
  if (status.status === 'fail') {
    return (
      <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
        Couldn&apos;t refresh this page today — open it to check
      </p>
    );
  }
  return null;
}

export function OfficialUrlList({
  urls,
  freshnessByUrl = {},
}: {
  urls: OfficialUrl[];
  freshnessByUrl?: Record<string, UrlFreshness>;
}) {
  if (!urls.length) return null;
  return (
    <ul className="space-y-2">
      {urls.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border px-3 py-2 hover:bg-muted"
          >
            <div className="text-sm font-medium underline-offset-4 hover:underline">
              {item.label}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {sourceKindLabel(item.kind)}
            </div>
            <SourceFetchStatus status={freshnessByUrl[item.url]} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PassportFailWarning({
  warning,
}: {
  warning: NonNullable<PlaybookStep['passport_fail_warning']>;
}) {
  return (
    <aside className="rounded-lg border-2 border-destructive bg-destructive/10 px-3 py-3">
      <p className="text-sm font-semibold text-destructive">{warning.title_en}</p>
      <p className="mt-1 text-sm leading-6 text-foreground">{warning.body_en}</p>
    </aside>
  );
}

export function GettingThereCard({ data }: { data: GettingThere }) {
  const [copied, setCopied] = useState(false);

  async function copyName() {
    try {
      await navigator.clipboard.writeText(data.copy_name_zh);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border border-border px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Getting there
      </p>
      <p className="mt-1 text-sm font-medium">{data.poi_en}</p>
      <div className="mt-2 flex items-start justify-between gap-2 rounded-md bg-muted px-2 py-2">
        <p className="text-base font-semibold leading-7">{data.copy_name_zh}</p>
        <Button type="button" variant="outline" size="sm" onClick={copyName}>
          <Copy className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Metro:{' '}
        {data.metro_line || data.metro_exit
          ? [data.metro_line, data.metro_exit].filter(Boolean).join(' · ')
          : 'Not listed — do not guess an exit'}
      </p>
      <p className="mt-1 text-sm leading-6">{data.notes_en}</p>
    </div>
  );
}

export function SpeechCardView({ card }: { card: SpeechCard }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyHanzi() {
    try {
      await navigator.clipboard.writeText(card.hanzi);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Say this
      </p>
      <p className="mt-2 text-[22px] font-semibold leading-9 text-foreground">{card.hanzi}</p>
      <p className="mt-1 text-sm text-muted-foreground">{card.pinyin}</p>
      <p className="mt-1 text-sm leading-6">{card.en}</p>
      <div className="mt-3 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copyHanzi}>
          <Copy className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          <Maximize2 className="size-3.5" />
          Show clerk
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-[calc(100%-1.5rem)] bg-background sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Show the window</DialogTitle>
          </DialogHeader>
          <p className="text-center text-[32px] font-bold leading-[1.35] text-foreground">
            {card.hanzi}
          </p>
          <p className="text-center text-sm text-muted-foreground">{card.pinyin}</p>
          <p className="text-center text-sm">{card.en}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClickPathView({
  path,
}: {
  path: NonNullable<PlaybookStep['click_path']>;
}) {
  return (
    <ol className="space-y-3">
      {path.steps.map((item) => (
        <li key={item.n} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {item.n}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-6">{item.text_en}</p>
            {item.screenshot ? (
              <figure className="mt-2">
                <img
                  src={item.screenshot}
                  alt={item.note ?? item.text_en}
                  className="w-full rounded-md border border-border"
                />
                {item.note ? (
                  <figcaption className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.note}
                  </figcaption>
                ) : null}
              </figure>
            ) : (
              <p className="mt-1.5 inline-flex rounded-full border border-dashed border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                Screenshot not added yet
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ConflictCallout({ conflict }: { conflict: Conflict }) {
  return (
    <div className="rounded-lg border-2 border-foreground px-3 py-3">
      <p className="text-sm font-semibold">{conflict.title_en}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Two sources. We never pick a winner. Resolution: verify at the window.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {conflict.sources.map((source) => (
          <a
            key={`${source.label}|${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border bg-muted/40 px-3 py-2 hover:bg-muted"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{source.label}</span>
              <Badge variant="outline" className="font-normal">
                {sourceKindLabel(source.kind)}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">as of {source.as_of}</p>
            <p className="mt-2 text-sm leading-6">{source.claim_en}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function ArrivalInput({
  arrivalAt,
  onChange,
}: {
  arrivalAt: string | null;
  onChange: (iso: string | null) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className="text-xs font-medium text-muted-foreground">
        When did you arrive?
      </span>
      <input
        type="datetime-local"
        className="mt-1 h-11 w-full rounded-full border border-input bg-white px-4 text-sm"
        value={isoToLocalInput(arrivalAt)}
        onChange={(e) => onChange(localInputToIso(e.target.value))}
      />
    </label>
  );
}

export function ArrivalTimer({
  arrivalAt,
  label,
  onArrivalChange,
}: {
  arrivalAt: string | null;
  label: string;
  onArrivalChange?: (iso: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!arrivalAt) {
    return (
      <div className="rounded-lg border border-border px-3 py-3 text-sm">
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-muted-foreground">
          {onArrivalChange
            ? 'Add your arrival time to start the 24-hour countdown.'
            : 'Add your arrival time in intake to start the 24-hour countdown.'}
        </p>
        {onArrivalChange ? (
          <ArrivalInput arrivalAt={arrivalAt} onChange={onArrivalChange} />
        ) : null}
      </div>
    );
  }

  const deadline = new Date(arrivalAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = deadline - now;
  const expired = remaining <= 0;
  const abs = Math.abs(remaining);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const s = Math.floor((abs % 60_000) / 1000);

  return (
    <div
      className={cn(
        'rounded-lg border-2 px-3 py-3',
        expired ? 'border-destructive bg-destructive/10' : 'border-foreground'
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
        {expired ? '+' : ''}
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:
        {String(s).padStart(2, '0')}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {expired
          ? 'Past 24 hours from the arrival you set. Register at the window.'
          : 'Remaining from the arrival time you set.'}
        {onArrivalChange && !editing ? (
          <>
            {' '}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4"
              onClick={() => setEditing(true)}
            >
              Change
            </button>
          </>
        ) : null}
      </p>
      {onArrivalChange && editing ? (
        <ArrivalInput
          arrivalAt={arrivalAt}
          onChange={(iso) => {
            onArrivalChange(iso);
            setEditing(false);
          }}
        />
      ) : null}
    </div>
  );
}

export function RequiredChecks({
  items,
  checked,
  onToggle,
  interactive = true,
}: {
  items: { id: string; label_en: string }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  interactive?: boolean;
}) {
  if (!interactive) {
    return (
      <div className="rounded-lg border border-dashed border-border px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Acknowledge — optional
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {items.map((item) => (
            <li key={item.id} className="text-sm leading-6">
              {item.label_en}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Check before you move on
      </p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-white px-3 py-2.5 text-left">
            <Checkbox
              checked={Boolean(checked[item.id])}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              className="mt-1 size-5 border-foreground/45 bg-white"
            />
            <span className="text-sm leading-6">{item.label_en}</span>
          </label>
        </li>
      ))}
    </ul>
    </div>
  );
}

export function WhatToBring({
  items,
  checked,
  onToggle,
  interactive = true,
}: {
  items: { id: string; label_en: string; required: boolean }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  interactive?: boolean;
}) {
  if (!interactive) {
    return (
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bring
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {items.map((item) => (
            <li key={item.id} className="text-sm leading-6">
              {item.label_en}
              {item.required ? (
                <span className="ml-1 text-xs text-destructive">required</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Bring
      </p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-white px-3 py-2.5 text-left">
            <Checkbox
              checked={Boolean(checked[item.id])}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              className="mt-1 size-5 border-foreground/45 bg-white"
            />
            <span className="text-sm leading-6">
              {item.label_en}
              {item.required ? (
                <span className="ml-1 text-xs text-destructive">required</span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
    </div>
  );
}

export function FailureTreeOverlay({
  tree,
  startNodeId,
  open,
  onOpenChange,
}: {
  tree: FailureTree;
  startNodeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentId, setCurrentId] = useState<string | null>(startNodeId ?? null);

  useEffect(() => {
    if (open) setCurrentId(startNodeId ?? null);
  }, [open, startNodeId]);

  const current = tree.nodes.find((n) => n.id === currentId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What went wrong?</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2">
          {tree.nodes.map((node) => {
            const active = node.id === current?.id;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  aria-expanded={active}
                  onClick={() => setCurrentId(active ? null : node.id)}
                  className={cn(
                    'flex min-h-11 w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium',
                    active
                      ? 'border-foreground bg-white'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <ChevronRight
                    className={cn(
                      'mt-0.5 size-4 shrink-0 transition-transform duration-200',
                      active && 'rotate-90'
                    )}
                  />
                  <span>{node.question_en}</span>
                </button>
                {active ? (
                  <div className="space-y-3 px-3 pb-1 pt-3">
                    <p className="text-sm leading-6">{node.advice_en}</p>
                    {node.vpn_off_only ? (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                        Network step: turn the VPN off and retry. That is the only
                        network advice.
                      </p>
                    ) : null}
                    {node.never.length ? (
                      <p className="text-sm font-medium text-destructive">
                        Don&apos;t: {node.never.join(', ').replaceAll('_', ' ')}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="text-xs leading-5 text-muted-foreground">
          None of these? Show the clerk the Chinese card on this step and ask at
          the window.
        </p>
        <Button type="button" className="h-11 rounded-full" onClick={() => onOpenChange(false)}>
          Back to the step
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function CitationFooter({
  urls,
  lastVerified,
  freshnessByUrl = {},
}: {
  urls: OfficialUrl[];
  lastVerified: string | null;
  freshnessByUrl?: Record<string, UrlFreshness>;
}) {
  return (
    <footer className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sources
        </p>
        <span className="text-xs text-muted-foreground">
          {lastVerified ? `Checked in person ${lastVerified}` : 'Not yet checked in person'}
        </span>
      </div>
      <OfficialUrlList urls={urls} freshnessByUrl={freshnessByUrl} />
    </footer>
  );
}

export { CitationFooter as PlaybookFooter };

export { buttonVariants };
