import { createFileRoute } from '@tanstack/react-router';

import { SourceStaleBadge } from '@/components/copilot/source-stale-badge';
import { Link } from '@/core/i18n/navigation';
import { PLAYBOOKS } from '@/lib/playbooks/catalog';
import { cn } from '@/lib/utils';

const LATER = [
  { title: 'Open a mainland bank account', note: 'Post-v1 — not a walkthrough yet.' },
  { title: 'Drive in Shenzhen', note: 'Post-v1 — not a walkthrough yet.' },
  { title: 'School enrollment', note: 'Post-v1 — not a walkthrough yet.' },
] as const;

function LibraryPage() {
  const first72 = PLAYBOOKS.filter((pb) => pb.lifecycle === '72h');
  const firstWeek = PLAYBOOKS.filter((pb) => pb.lifecycle === 'first_week');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          YAML playbooks. Grey cards are later — visible, not fake walkthroughs.
        </p>
      </div>

      <Group title="72 hours">
        {first72.map((pb) => (
          <PlaybookCard
            key={pb.id}
            id={pb.id}
            title={pb.title_en}
            summary={pb.summary_en}
            live
          />
        ))}
      </Group>

      <Group title="First week">
        {firstWeek.map((pb) => (
          <PlaybookCard
            key={pb.id}
            id={pb.id}
            title={pb.title_en}
            summary={pb.summary_en}
            live
          />
        ))}
      </Group>

      <Group title="Later">
        {LATER.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-muted/50 px-4 py-3 opacity-70"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PlaybookCard({
  id,
  title,
  summary,
  live,
}: {
  id: string;
  title: string;
  summary: string;
  live: boolean;
}) {
  return (
    <Link
      href={`/run/${id}`}
      className={cn(
        'block rounded-xl border border-border px-4 py-3 hover:bg-muted',
        !live && 'pointer-events-none opacity-60'
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-[11px] text-muted-foreground">{id}</span>
        <SourceStaleBadge lastVerified={null} />
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{summary}</p>
    </Link>
  );
}

export const Route = createFileRoute('/(copilot)/library')({
  component: LibraryPage,
});
