import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { MapPin, TrainFront } from 'lucide-react';

import { CopilotChrome } from '@/components/copilot/chrome';
import { GUIDE_DISC, RatingBadge } from '@/components/guide/guide-parts';
import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import {
  GUIDE_AREAS,
  GUIDE_CATEGORIES,
  GUIDE_CATEGORY_LABEL,
  GUIDE_ENTRIES,
  guideCounts,
  type GuideCategory,
  type GuideEntry,
} from '@/lib/guide/catalog';
import { cn } from '@/lib/utils';

type GuideSearch = { c?: GuideCategory; area?: string };

const DESCRIPTION =
  'Food, coffee and small tips from a developer living in Shenzhen — places actually visited, with Chinese addresses and metro exits.';

const INTRO: Record<'all' | GuideCategory, string> = {
  all: "Places I've actually eaten, worked from, and gone back to. Not sponsored, not a ranking of the whole city.",
  food: 'Restaurants I have tried myself, from Shekou beef offal to late-night Guizhou barbecue.',
  coffee: 'Coffee shops I have visited — several are where I bring my laptop to code.',
  tips: 'Small things that make daily life in Shenzhen easier.',
};

function GuidePage() {
  const { c, area } = Route.useSearch();
  const counts = guideCounts();

  const inCategory = GUIDE_ENTRIES.filter((e) => !c || e.category === c);
  const areas = GUIDE_AREAS.filter((a) => inCategory.some((e) => e.area === a));
  const entries = inCategory.filter((e) => !area || e.area === area);

  return (
    <CopilotChrome>
      <div className="space-y-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Felix&apos;s Shenzhen guide
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {INTRO[c ?? 'all']}
          </p>
        </header>

        <nav aria-label="Guide categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2.5">
            <li>
              <CategoryPill label="All" count={GUIDE_ENTRIES.length} active={!c} search={{}} />
            </li>
            {GUIDE_CATEGORIES.map((cat) => (
              <li key={cat}>
                <CategoryPill
                  label={GUIDE_CATEGORY_LABEL[cat]}
                  count={counts[cat]}
                  disc={GUIDE_DISC[cat]}
                  active={c === cat}
                  search={{ c: cat }}
                />
              </li>
            ))}
          </ul>
        </nav>

        {areas.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Area</span>
            <AreaLink label="Anywhere" active={!area} search={{ c }} />
            {areas.map((a) => (
              <AreaLink key={a} label={a} active={area === a} search={{ c, area: a }} />
            ))}
          </div>
        )}

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <GuideCard entry={entry} />
              </li>
            ))}
          </ul>
        )}

        <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
          Personal notes, not paid placements. Shops move and close — check the map app before you
          go. Looking for payments, VOA or registration?{' '}
          <Link href="/library" className="font-medium text-foreground underline underline-offset-4">
            Open the playbook library
          </Link>
          .
        </p>
      </div>
    </CopilotChrome>
  );
}

function CategoryPill({
  label,
  count,
  disc,
  active,
  search,
}: {
  label: string;
  count: number;
  disc?: string;
  active: boolean;
  search: GuideSearch;
}) {
  return (
    <RouterLink
      to="/guide"
      search={search}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-11 items-center gap-2 whitespace-nowrap rounded-full pr-4 text-sm font-medium transition-colors',
        disc ? 'pl-1.5' : 'pl-4',
        active
          ? 'bg-[#2F3130] text-white'
          : 'bg-white text-foreground shadow-[0_8px_24px_rgba(47,49,48,0.06)] hover:bg-white/80'
      )}
    >
      {disc && (
        <span className="size-8 rounded-full" style={{ background: disc }} aria-hidden />
      )}
      {label}
      <span className={cn('tabular-nums', active ? 'text-white/60' : 'text-muted-foreground')}>
        {count}
      </span>
    </RouterLink>
  );
}

function AreaLink({ label, active, search }: { label: string; active: boolean; search: GuideSearch }) {
  return (
    <RouterLink
      to="/guide"
      search={search}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'underline-offset-4 hover:underline',
        active ? 'font-semibold text-foreground underline' : 'text-foreground/70'
      )}
    >
      {label}
    </RouterLink>
  );
}

function GuideCard({ entry }: { entry: GuideEntry }) {
  const cover = entry.photos[0];
  const station = entry.metro?.split(',')[0];

  return (
    <Link
      href={`/guide/${entry.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_8px_24px_rgba(47,49,48,0.06)] transition-transform duration-300 ease-out hover:-translate-y-0.5',
        entry.closed && 'opacity-60'
      )}
    >
      {cover ? (
        <div className="aspect-[4/3] overflow-hidden bg-[#E5DFD0]">
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div
          className="flex h-20 items-end px-5 pb-2"
          style={{ background: GUIDE_DISC[entry.category] }}
          aria-hidden
        />
      )}
      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-semibold leading-6 tracking-tight">{entry.title}</h2>
          {entry.rating != null && <RatingBadge rating={entry.rating} className="mt-0.5 shrink-0" />}
        </div>
        {entry.title_zh && (
          <p className="text-sm text-muted-foreground" lang="zh-CN">
            {entry.title_zh}
          </p>
        )}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/80">{entry.summary}</p>
        {(entry.area || station || entry.closed) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-muted-foreground">
            {entry.closed && <span className="font-semibold text-[#C2453A]">Permanently closed</span>}
            {entry.area && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {entry.area}
              </span>
            )}
            {station && (
              <span className="inline-flex items-center gap-1">
                <TrainFront className="size-3.5" aria-hidden />
                {station}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export const Route = createFileRoute('/guide/')({
  validateSearch: (search: Record<string, unknown>): GuideSearch => ({
    c: GUIDE_CATEGORIES.includes(search.c as GuideCategory)
      ? (search.c as GuideCategory)
      : undefined,
    area: typeof search.area === 'string' ? search.area : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Felix's Shenzhen guide — food, coffee & tips" },
      { name: 'description', content: DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/guide` }],
  }),
  component: GuidePage,
});
