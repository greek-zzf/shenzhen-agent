import { createFileRoute } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';

function UnsupportedCityPage() {
  return (
    <CopilotChrome>
      <article className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          This copilot covers Shenzhen only
        </h1>
        <p className="text-sm leading-6">
          Steps, windows, and one-stop desks here are Shenzhen-specific. We will
          not walk you through another city as if it were the same playbook.
        </p>
        <Link href="/" className="inline-flex text-sm font-medium underline underline-offset-4">
          Back to Shenzhen Copilot
        </Link>
      </article>
    </CopilotChrome>
  );
}

export const Route = createFileRoute('/unsupported-city')({
  head: () => ({
    meta: [
      { title: 'Unsupported city — Shenzhen Copilot' },
      { name: 'description', content: 'This copilot covers Shenzhen only.' },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/unsupported-city` }],
  }),
  component: UnsupportedCityPage,
});
