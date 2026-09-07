import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/core/i18n/navigation';
import { askPlaybookGuidanceFn } from '@/lib/playbooks/ask-guidance';
import {
  GUIDANCE_EMPTY_STATE,
  GUIDANCE_MAX_MESSAGE_CHARS,
  GUIDANCE_UNAVAILABLE_NOTE,
  type GuidanceAnswer,
} from '@/lib/playbooks/guidance';
import type { CopilotProfile } from '@/lib/playbooks/profile';
import type { Playbook } from '@/lib/playbooks/schema';
import { cn } from '@/lib/utils';

type ChatItem = {
  role: 'user' | 'helper';
  text: string;
  citations?: string[];
  failureNodeId?: string | null;
  refused?: boolean;
};

function CitationChips({
  citations,
  playbookId,
}: {
  citations: string[];
  playbookId: string;
}) {
  if (!citations.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((id) => {
        if (id.startsWith('http://') || id.startsWith('https://')) {
          return (
            <li key={id}>
              <a
                href={id}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
              >
                source
              </a>
            </li>
          );
        }
        if (/^pb-\d{2}$/.test(id) && id !== playbookId) {
          return (
            <li key={id}>
              <Link
                href={`/run/${id}`}
                className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] underline-offset-4 hover:underline"
              >
                {id}
              </Link>
            </li>
          );
        }
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] underline-offset-4 hover:underline"
            >
              {id}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function HelpBody({
  playbook,
  currentTitle,
  assistOff,
  items,
  draft,
  sending,
  error,
  onDraftChange,
  onSend,
  onOpenFailureNode,
  className,
}: {
  playbook: Playbook;
  currentTitle: string;
  assistOff: boolean;
  items: ChatItem[];
  draft: string;
  sending: boolean;
  error: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onOpenFailureNode?: (nodeId: string) => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 flex-col rounded-2xl border border-border bg-white p-4 shadow-[0_8px_24px_rgba(47,49,48,0.06)]',
        className
      )}
    >
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ask
        </p>
        <h2 className="text-sm font-semibold tracking-tight">
          This step: {currentTitle}
        </h2>
        <p className="text-xs leading-5 text-muted-foreground">
          {assistOff ? GUIDANCE_UNAVAILABLE_NOTE : GUIDANCE_EMPTY_STATE}
        </p>
      </header>

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
        {items.length === 0 && !assistOff ? (
          <p className="text-xs leading-5 text-muted-foreground">
            The checklist is the product. I only explain this step — I do not tap
            WeChat or rewrite the playbook.
          </p>
        ) : null}
        {items.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={cn(
              'rounded-lg px-3 py-2 text-sm leading-6',
              item.role === 'user'
                ? 'bg-muted text-foreground'
                : 'border border-border bg-background'
            )}
          >
            <p>{item.text}</p>
            {item.role === 'helper' ? (
              <CitationChips
                citations={item.citations ?? []}
                playbookId={playbook.id}
              />
            ) : null}
            {item.failureNodeId && onOpenFailureNode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-8 rounded-full"
                onClick={() => onOpenFailureNode(item.failureNodeId as string)}
              >
                Open I&apos;m stuck: {item.failureNodeId}
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <div className="mt-3 space-y-2">
        <label className="sr-only">
          Ask about this step
        </label>
        <Textarea
          rows={3}
          maxLength={GUIDANCE_MAX_MESSAGE_CHARS}
          disabled={assistOff || sending}
          placeholder="What should I bring for this step?"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-full"
          disabled={assistOff || sending || !draft.trim()}
          onClick={onSend}
        >
          {sending ? 'Reading…' : 'Ask about this step'}
        </Button>
      </div>
    </section>
  );
}

export function PlaybookHelp({
  playbook,
  profile,
  currentStepId,
  available,
  onOpenFailureNode,
  mobileOpen,
  onMobileOpenChange,
}: {
  playbook: Playbook;
  profile: CopilotProfile;
  currentStepId: string;
  available: boolean;
  onOpenFailureNode?: (nodeId: string) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const step =
    playbook.steps.find((item) => item.id === currentStepId) ?? playbook.steps[0];
  const [items, setItems] = useState<ChatItem[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [assistOff, setAssistOff] = useState(!available);

  async function send() {
    const message = draft.trim();
    if (!message || assistOff || sending) return;
    setSending(true);
    setError('');
    setItems((prev) => [...prev, { role: 'user', text: message }]);
    setDraft('');
    try {
      const result = await askPlaybookGuidanceFn({
        data: {
          playbookId: playbook.id,
          currentStepId: step?.id,
          message,
          profile,
        },
      });
      if (!result.available) {
        setAssistOff(true);
        return;
      }
      const answer: GuidanceAnswer = result.answer;
      setItems((prev) => [
        ...prev,
        {
          role: 'helper',
          text: answer.answer,
          citations: answer.citations,
          failureNodeId: answer.failure_tree_node_id,
          refused: answer.refused,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not answer from this playbook.'
      );
    } finally {
      setSending(false);
    }
  }

  const bodyProps = {
    playbook,
    currentTitle: step?.title_en ?? playbook.title_en,
    assistOff,
    items,
    draft,
    sending,
    error,
    onDraftChange: setDraft,
    onSend: () => void send(),
  };

  return (
    <>
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-5rem)]">
        <HelpBody
          {...bodyProps}
          onOpenFailureNode={onOpenFailureNode}
          className="max-h-[calc(100vh-5rem)]"
        />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Ask about this step</SheetTitle>
            <SheetDescription>{GUIDANCE_EMPTY_STATE}</SheetDescription>
          </SheetHeader>
          <HelpBody
            {...bodyProps}
            onOpenFailureNode={(id) => {
              onMobileOpenChange(false);
              onOpenFailureNode?.(id);
            }}
            className="min-h-[70vh] rounded-none border-0 shadow-none"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function PlaybookHelpTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-full lg:hidden"
      onClick={onClick}
    >
      <HelpCircle className="size-3.5" />
      Ask
    </Button>
  );
}
