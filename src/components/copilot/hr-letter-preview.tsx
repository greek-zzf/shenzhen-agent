import { SourceStaleBadge } from './source-stale-badge';

export function HrLetterPreview() {
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
        Procedure guide, not legal, medical, or immigration advice. Do not treat
        this page as a 住宿登记. Never fake a slip or a company seal.
      </p>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">住宿情况说明 / Stay note</h1>
        <p className="text-sm text-muted-foreground">For HR — gentle, no accusation</p>
      </header>

      <section className="space-y-3">
        <p className="text-[17px] leading-8">
          您好，我正在按法规办理临时住宿登记。现附上官方说明材料与我目前的住宿情况说明，请查收。如需补充材料，我可以配合。
        </p>
        <p className="text-sm leading-6">
          Hello. I am completing temporary accommodation registration as required.
          Please find official background materials and a note on my current stay.
          I can provide more documents if needed.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-foreground px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide">Official</p>
          <a
            className="mt-1 block text-sm font-medium underline underline-offset-4"
            href="https://www.sz.gov.cn/en_szgov/news/infocus/SZCitywalk/Explore/Plan/content/post_11845338.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            sz.gov.cn English living / planning materials
          </a>
          <p className="mt-2 text-sm leading-6">
            City English background on living in Shenzhen. Not an HR policy and
            not a six-month lease requirement.
          </p>
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
            before HR paperwork. Field report only — verify. Not law.
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
