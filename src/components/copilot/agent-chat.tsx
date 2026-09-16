import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowUp, BookOpen } from 'lucide-react';

import { MarkdownContent } from '@/components/markdown-content';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import {
  AGENT_EMPTY_HINTS,
  AGENT_FRAMING,
  AGENT_MAX_MESSAGE_CHARS,
  type AgentChatResult,
  type AgentSource,
  type PlaybookSuggestion,
} from '@/lib/agent-corpus/types';
import { cn } from '@/lib/utils';

type ChatItem =
  | { role: 'user'; text: string }
  | { role: 'assistant'; result: AgentChatResult };

const KIND_LABEL: Record<AgentSource['kind'], string> = {
  official: 'Official',
  user_report: 'User report',
  sop: 'Playbook',
  docs: 'Notes',
};

function isOpenableUrl(url: string): boolean {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/run/')
  );
}

export function SourceCards({ sources }: { sources: AgentSource[] }) {
  if (!sources.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {sources.map((source) => {
        const chip = (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] leading-4">
            <span className="shrink-0 text-muted-foreground">
              {KIND_LABEL[source.kind]}
            </span>
            <span className="truncate font-medium">{source.title}</span>
          </span>
        );
        if (source.url.startsWith('http://') || source.url.startsWith('https://')) {
          return (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80"
              >
                {chip}
              </a>
            </li>
          );
        }
        if (source.url.startsWith('/run/')) {
          return (
            <li key={source.id}>
              <Link href={source.url} className="block hover:opacity-80">
                {chip}
              </Link>
            </li>
          );
        }
        return <li key={source.id}>{chip}</li>;
      })}
    </ul>
  );
}

function PlaybookLinks({ items }: { items: PlaybookSuggestion[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.playbookId}>
          <Link
            href={item.href}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lawn-ink)] px-3 py-1 text-[11px] font-medium text-white"
          >
            <BookOpen className="size-3" />
            Open {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AgentChat() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) =>
      apiPost<AgentChatResult>('/api/agent-chat', { message }),
    onSuccess: (result) => {
      setItems((prev) => [...prev, { role: 'assistant', result }]);
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not answer from our notes.');
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, mutation.isPending]);

  function send(raw?: string) {
    const message = (raw ?? draft).trim();
    if (!message || mutation.isPending) return;
    setError('');
    setDraft('');
    setItems((prev) => [...prev, { role: 'user', text: message }]);
    mutation.mutate(message);
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Agent
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Shenzhen errands agent
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{AGENT_FRAMING}</p>
      </header>

      <div className="mt-6 min-h-0 flex-1 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
            <p className="text-sm leading-6 text-muted-foreground">
              Ask a sourced question. I will not invent hours, fees, or NIA
              lists. Conflicts stay side by side. Draft notes — not
              field-verified.
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Try
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {AGENT_EMPTY_HINTS.map((hint) => (
                <li key={hint.id}>
                  <button
                    type="button"
                    className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-left text-sm hover:bg-muted"
                    onClick={() => send(hint.question)}
                  >
                    <span className="mr-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {hint.label}
                    </span>
                    {hint.question}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {items.map((item, index) =>
          item.role === 'user' ? (
            <div
              key={`u-${index}`}
              className="ml-8 rounded-2xl bg-white px-4 py-3 text-sm leading-6 shadow-[0_8px_24px_rgba(47,49,48,0.06)]"
            >
              {item.text}
            </div>
          ) : (
            <div
              key={`a-${index}`}
              className={cn(
                'rounded-[1.75rem] border border-border bg-white px-5 py-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]',
                item.result.refused && 'border-[color:color-mix(in_oklab,var(--lawn-tomato)_35%,white)]'
              )}
            >
              <MarkdownContent
                content={item.result.answerMarkdown}
                className="text-sm"
              />
              <SourceCards sources={item.result.sources} />
              <PlaybookLinks items={item.result.playbookSuggestions} />
            </div>
          )
        )}
        {mutation.isPending ? (
          <p className="text-xs text-muted-foreground">Reading our notes…</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <div className="sticky bottom-0 mt-4 rounded-[1.75rem] bg-white p-3 shadow-[0_8px_24px_rgba(47,49,48,0.08)]">
        <label className="sr-only" htmlFor="agent-composer">
          Ask the errands agent
        </label>
        <Textarea
          id="agent-composer"
          rows={3}
          maxLength={AGENT_MAX_MESSAGE_CHARS}
          disabled={mutation.isPending}
          placeholder="Ask about payments, 24h lodging, or metro QR…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Retrieval-only. Click a source to open the original page.
          </p>
          <Button
            type="button"
            className="h-9 rounded-full"
            disabled={mutation.isPending || !draft.trim()}
            onClick={() => send()}
          >
            <ArrowUp className="size-3.5" />
            Ask
          </Button>
        </div>
      </div>
    </section>
  );
}

