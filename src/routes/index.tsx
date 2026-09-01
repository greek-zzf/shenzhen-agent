import { createFileRoute } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { getLocale } from '@/paraglide/runtime.js';

const SITUATIONS = [
  { href: '/p/alipay-metro', label: "Can't pay" },
  { href: '/p/voa-hours', label: '5-day VOA' },
  { href: '/p/accommodation-registration', label: '24h register' },
] as const;

function HomePage() {
  return (
    <CopilotChrome>
      <div className="flex min-h-[70vh] flex-col justify-center gap-8">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Shenzhen only
          </p>
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight">
            A live playbook for the first 72 hours — not a city guide.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Short intake, then numbered steps from a YAML SOP. We do not invent
            hours, streets, or a visa approval.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {SITUATIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-12 items-center justify-between rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              {item.label}
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/login?next=/intake"
          className="flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
        >
          Start with my passport
        </Link>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/disclaimer" className="underline underline-offset-4">
            Disclaimer
          </Link>
          {' · '}
          <Link href="/unsupported-city" className="underline underline-offset-4">
            Not Shenzhen?
          </Link>
        </p>
      </div>
    </CopilotChrome>
  );
}

export const Route = createFileRoute('/')({
  loader: () => ({ locale: getLocale() }),
  head: () => ({
    meta: [
      { title: 'Shenzhen Copilot' },
      {
        name: 'description',
        content:
          'English playbooks for getting paid, registered, and through Shenzhen. Draft SOPs — not legal advice.',
      },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/` }],
  }),
  component: HomePage,
});
