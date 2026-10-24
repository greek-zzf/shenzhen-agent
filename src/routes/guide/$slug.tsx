import { createFileRoute, notFound, Link as RouterLink } from '@tanstack/react-router';
import { ArrowLeft, MapPin } from 'lucide-react';

import { CopilotChrome } from '@/components/copilot/chrome';
import { CopyLine, GUIDE_DISC, RatingBadge } from '@/components/guide/guide-parts';
import { MarkdownContent } from '@/components/markdown-content';
import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import {
  GUIDE_BY_SLUG,
  GUIDE_CATEGORY_LABEL,
  GUIDE_ENTRIES,
  type GuideEntry,
} from '@/lib/guide/catalog';

function GuideEntryPage() {
  const { entry } = Route.useLoaderData();
  const hasPlace = entry.address || entry.address_zh || entry.metro;
  const nearby = GUIDE_ENTRIES.filter(
    (e) => e.slug !== entry.slug && !e.closed && e.area && e.area === entry.area
  ).slice(0, 3);

  return (
    <CopilotChrome>
      <article>
        <RouterLink
          to="/guide"
          search={{ c: entry.category }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {GUIDE_CATEGORY_LABEL[entry.category]}
        </RouterLink>

        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ background: GUIDE_DISC[entry.category] }}
                aria-hidden
              />
              {GUIDE_CATEGORY_LABEL[entry.category]}
            </span>
            {entry.area && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {entry.area}
              </span>
            )}
            {entry.rating != null && <RatingBadge rating={entry.rating} className="text-foreground" />}
          </div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {entry.title}
          </h1>
          {entry.title_zh && (
            <p className="mt-1 text-lg text-muted-foreground" lang="zh-CN">
              {entry.title_zh}
            </p>
          )}
          {entry.closed && (
            <p className="mt-4 rounded-2xl bg-[#FE6255]/12 px-4 py-3 text-sm font-medium text-[#A8372D]">
              This place has permanently closed. The notes stay here for the record.
            </p>
          )}
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0">
            <MarkdownContent content={entry.body} className="max-w-[68ch]" />
            {entry.photos.length > 0 && <Photos entry={entry} />}
          </div>

          {(hasPlace || entry.good_for?.length || entry.rating_note) && (
            <aside className="space-y-4 lg:sticky lg:top-6">
              {hasPlace && (
                <section className="space-y-4 rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
                  {entry.address_zh ? (
                    <CopyLine label="Address — show the driver" zh={entry.address_zh} en={entry.address} />
                  ) : (
                    entry.address && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Address
                        </p>
                        <p className="mt-1.5 text-sm leading-6">{entry.address}</p>
                      </div>
                    )
                  )}
                  {entry.metro_zh ? (
                    <CopyLine label="Metro" zh={entry.metro_zh} en={entry.metro} />
                  ) : (
                    entry.metro && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Metro
                        </p>
                        <p className="mt-1.5 text-sm leading-6">{entry.metro}</p>
                      </div>
                    )
                  )}
                  {entry.location_note && (
                    <MarkdownContent content={entry.location_note} className="text-sm leading-6" />
                  )}
                </section>
              )}

              {entry.good_for && entry.good_for.length > 0 && (
                <section className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Good for
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {entry.good_for.map((g) => (
                      <li key={g} className="rounded-full bg-[#EEE8DA] px-3 py-1 text-sm">
                        {g}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {entry.rating != null && (
                <section className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(47,49,48,0.06)]">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    My rating
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {entry.rating.toFixed(1)}
                    <span className="text-base font-medium text-muted-foreground"> / 5</span>
                  </p>
                  {entry.rating_note && (
                    <p className="mt-1 text-sm leading-6 text-foreground/80">{entry.rating_note}</p>
                  )}
                </section>
              )}
            </aside>
          )}
        </div>

        <footer className="mt-12 space-y-8 border-t border-[#2F3130]/10 pt-8">
          {nearby.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold tracking-tight">Also in {entry.area}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {nearby.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/guide/${e.slug}`}
                      className="flex items-center gap-3 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium transition-transform duration-300 ease-out hover:translate-x-1"
                    >
                      <span
                        className="size-8 shrink-0 rounded-full"
                        style={{ background: GUIDE_DISC[e.category] }}
                        aria-hidden
                      />
                      <span className="truncate">{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-xs leading-5 text-muted-foreground">
            Personal notes from a visit; prices and menus change.
            {entry.source && (
              <>
                {' '}
                <a
                  href={entry.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Original note
                </a>
                .
              </>
            )}
          </p>
        </footer>
      </article>
    </CopilotChrome>
  );
}

function Photos({ entry }: { entry: GuideEntry }) {
  return (
    <section className="mt-10" aria-label="Photos">
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {entry.photos.map((src, i) => (
          <li key={src} className="overflow-hidden rounded-2xl bg-[#E5DFD0]">
            <a href={src} target="_blank" rel="noopener noreferrer">
              <img
                src={src}
                alt={`${entry.title} — photo ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="aspect-square size-full object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const Route = createFileRoute('/guide/$slug')({
  loader: ({ params }) => {
    const entry = GUIDE_BY_SLUG[params.slug];
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { entry } = loaderData;
    const title = entry.title_zh ? `${entry.title} (${entry.title_zh})` : entry.title;
    const url = `${envConfigs.app_url}/guide/${entry.slug}`;
    return {
      meta: [
        { title: `${title} — Felix's Shenzhen guide` },
        { name: 'description', content: entry.summary },
        { property: 'og:title', content: title },
        { property: 'og:description', content: entry.summary },
        ...(entry.photos[0] ? [{ property: 'og:image', content: entry.photos[0] }] : []),
      ],
      links: [{ rel: 'canonical', href: url }],
    };
  },
  component: GuideEntryPage,
});
