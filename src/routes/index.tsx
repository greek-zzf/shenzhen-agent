import { createFileRoute } from '@tanstack/react-router';

import { HomeLawn } from '@/blocks/home-lawn';
import { envConfigs } from '@/config';
import { getLocale } from '@/paraglide/runtime.js';

function HomePage() {
  return <HomeLawn />;
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
