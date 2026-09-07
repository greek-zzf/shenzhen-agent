import { formatOfficialFetchedAt } from '@/lib/playbooks/freshness';
import type { HrMaterialsExcerpt } from '@/lib/playbooks/hr-materials';

import { SourceStaleBadge } from './source-stale-badge';

const FALLBACK_MATERIALS_URL =
  'https://www.sz.gov.cn/en_szgov/news/infocus/SZCitywalk/Explore/Plan/content/post_11845338.html';

export function HrLetterPreview({
  excerpt,
}: {
  excerpt: HrMaterialsExcerpt;
}) {
  const officialUrl = excerpt.url || FALLBACK_MATERIALS_URL;

  return (
    <article className="hr-letter space-y-6 bg-background text-foreground print:max-w-none">
      <style>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <SourceStaleBadge lastVerified={null} />
        <p className="text-xs text-muted-foreground">
          Print view — not a PDF library, not a chop.
        </p>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Procedure note for work- / residence-permit documents — not legal advice.
        Do not treat this page as a 住宿登记. Never fake a slip or a company seal.
      </p>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">住宿情况说明 / Stay note</h1>
        <p className="text-sm text-muted-foreground">For HR — gentle, no accusation</p>
      </header>

      <section className="space-y-3">
        <p className="text-[17px] leading-8">
          您好，我正在按法规办理临时住宿登记。现附上官方公开材料清单中的具名文件摘录与我目前的住宿情况说明，请查收。如需补充材料，我可以配合。本说明不判断是否必须提供租房合同。
        </p>
        <p className="text-sm leading-6">
          Hello. I am completing temporary accommodation registration as required.
          Please find a short excerpt of named items from the official English
          materials page, plus a note on my current stay. I can provide more
          documents if needed. This note does not decide whether a lease is
          required.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-foreground px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide">Official</p>
          <a
            className="mt-1 block text-sm font-medium underline underline-offset-4"
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            sz.gov.cn English — work-permit materials
          </a>
          <OfficialExcerpt excerpt={excerpt} />
        </div>
        <div className="rounded-lg border border-border px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide">
            非法律来源
          </p>
          <a
            className="mt-1 block text-sm font-medium underline underline-offset-4"
            href="https://www.reddit.com/r/shenzhen/comments/1upmequ/"
            target="_blank"
            rel="noopener noreferrer"
          >
            r/shenzhen 1upmequ
          </a>
          <p className="mt-2 text-sm leading-6">
            Users report some employers asking for a six-month lease or 住宿登记
            before HR paperwork. Field report only — not law. Verify with HR.
          </p>
        </div>
      </section>

      <p className="text-sm font-medium">
        I have these: this one-pager plus whatever real stay proof I actually
        hold (hotel folio or a completed 住宿登记). Nothing here is a fake chop.
      </p>
    </article>
  );
}

function OfficialExcerpt({ excerpt }: { excerpt: HrMaterialsExcerpt }) {
  if (excerpt.status === 'ok' && excerpt.items.length) {
    return (
      <div className="mt-2 space-y-2">
        <p className="text-sm leading-6">
          Named items on the official English materials page (allowlisted
          excerpt, not a complete list, not HR policy):
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
          {excerpt.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Source fetched {formatOfficialFetchedAt(excerpt.fetched_at ?? '')}.{' '}
          {excerpt.url}
        </p>
      </div>
    );
  }

  if (excerpt.status === 'missing') {
    return (
      <p className="mt-2 text-sm leading-6">
        Official page fetched
        {excerpt.fetched_at
          ? ` ${formatOfficialFetchedAt(excerpt.fetched_at)}`
          : ''}
        , but no allowlisted document names were found. Open the linked page.
        This letter does not say whether a lease is required.
      </p>
    );
  }

  return (
    <p className="mt-2 text-sm leading-6">
      Official excerpt stale or missing — the materials page could not be
      refreshed. Open the linked page. This letter does not say whether a lease
      is required.
    </p>
  );
}
