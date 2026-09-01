import { createFileRoute } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { SourceStaleBadge } from '@/components/copilot/source-stale-badge';
import { envConfigs } from '@/config';

function DisclaimerPage() {
  return (
    <CopilotChrome>
      <article className="space-y-4">
        <SourceStaleBadge lastVerified={null} />
        <h1 className="text-2xl font-semibold tracking-tight">Disclaimer</h1>
        <p className="text-sm leading-6">
          Shenzhen Copilot is a procedure guide. It is not legal advice, not
          medical advice, and not immigration advice. A complete folder is not a
          visa, a payment, or a police registration.
        </p>
        <p className="text-sm leading-6">
          Every playbook in v1 is a draft SOP. <code>last_verified</code> is
          null, so a stale badge always shows. We do not pretend steps are
          field-verified. Official pages and labeled guides sit next to user
          reports — we never pick a winner.
        </p>
        <p className="text-sm leading-6">
          HeyShenzhen and HiShenzhen links are 指南, 非法律. Reddit links are
          非法律来源. We never recommend binding WeChat through a friend, and we
          never submit a form on your behalf.
        </p>
      </article>
    </CopilotChrome>
  );
}

export const Route = createFileRoute('/disclaimer')({
  head: () => ({
    meta: [
      { title: 'Disclaimer — Shenzhen Copilot' },
      {
        name: 'description',
        content: 'Procedure guide, not legal, medical, or immigration advice.',
      },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/disclaimer` }],
  }),
  component: DisclaimerPage,
});
