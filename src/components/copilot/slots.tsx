import { useEffect, useState } from 'react';
import { Copy, Maximize2 } from 'lucide-react';

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
import type {
  Conflict,
  FailureNode,
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
        could not refresh official source
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
    <div className="rounded-lg border-2 border-foreground bg-card px-3 py-3">
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
              <img
                src={item.screenshot}
                alt=""
                className="mt-2 w-full rounded-md border border-border"
              />
            ) : (
              <div className="mt-2 flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                missing art
              </div>
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
            key={source.url}
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

export function ArrivalTimer({
  arrivalAt,
  label,
}: {
  arrivalAt: string | null;
  label: string;
}) {
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
          Set your arrival time on the profile card to start the 24-hour countdown.
        </p>
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
          : 'Remaining from the arrival time on your profile.'}
      </p>
    </div>
  );
}

export function RequiredChecks({
  items,
  checked,
  onToggle,
}: {
  items: { id: string; label_en: string }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2">
            <Checkbox
              checked={Boolean(checked[item.id])}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-6">{item.label_en}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function WhatToBring({
  items,
  checked,
  onToggle,
}: {
  items: { id: string; label_en: string; required: boolean }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2">
            <Checkbox
              checked={Boolean(checked[item.id])}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              className="mt-0.5"
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
  const start = tree.nodes.find((n) => n.id === startNodeId) ?? tree.nodes[0];
  const [current, setCurrent] = useState<FailureNode>(start);

  useEffect(() => {
    if (open) {
      setCurrent(tree.nodes.find((n) => n.id === startNodeId) ?? tree.nodes[0]);
    }
  }, [open, startNodeId, tree.nodes]);

  const next = current.next
    ? tree.nodes.find((n) => n.id === current.next)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tree.title_en}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm font-medium">{current.question_en}</p>
          <p className="text-sm leading-6">{current.advice_en}</p>
          {current.vpn_off_only ? (
            <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
              Network step: turn the VPN off and retry. That is the only network advice.
            </p>
          ) : null}
          {current.never.length ? (
            <p className="text-sm font-medium text-destructive">
              Never: {current.never.join(', ').replaceAll('_', ' ')}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {next ? (
              <Button type="button" onClick={() => setCurrent(next)}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
            {current.id !== start.id ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrent(start)}
              >
                Start over
              </Button>
            ) : null}
          </div>
        </div>
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
          Official URLs
        </p>
        <span className="text-xs text-muted-foreground">
          last_verified: {lastVerified ?? 'null'}
        </span>
      </div>
      <OfficialUrlList urls={urls} freshnessByUrl={freshnessByUrl} />
    </footer>
  );
}

export { CitationFooter as PlaybookFooter };

export { buttonVariants };
