import { formatOfficialFetchedAt } from '@/lib/playbooks/freshness';
import type { NiaEligibility } from '@/lib/playbooks/nia-eligibility';

export function NiaEligibilityCard({
  eligibility,
}: {
  eligibility: NiaEligibility;
}) {
  return (
    <aside className="space-y-2 rounded-lg border-2 border-foreground px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide">
        Live NIA English pages
      </p>
      {eligibility.mode === 'grounded' && eligibility.summary ? (
        <p className="text-sm leading-6">{eligibility.summary}</p>
      ) : (
        <p className="text-sm leading-6">
          Open the official NIA English FAQ and Instructions. This playbook
          does not store a nationality table and will not invent who is
          eligible.
        </p>
      )}
      <ul className="space-y-2">
        {eligibility.pages.map((page) => (
          <li key={page.url}>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline underline-offset-4"
            >
              {page.label}
            </a>
            <p className="text-[11px] text-muted-foreground">
              {page.status === 'ok' && page.fetched_at
                ? `fetched ${formatOfficialFetchedAt(page.fetched_at)}`
                : 'could not refresh official source'}
            </p>
          </li>
        ))}
      </ul>
      {eligibility.fetched_at ? (
        <p className="text-[11px] text-muted-foreground">
          Latest fetch {formatOfficialFetchedAt(eligibility.fetched_at)}
        </p>
      ) : null}
    </aside>
  );
}
