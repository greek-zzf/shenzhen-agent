import { notFound } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { PlaybookView } from '@/components/copilot/playbook-view';
import { envConfigs } from '@/config';
import { getPublicPlaybook } from '@/lib/playbooks/catalog';
import { EMPTY_PROFILE } from '@/lib/playbooks/profile';
import type { Playbook } from '@/lib/playbooks/schema';

export function loadPublicPlaybook(slug: string): { playbook: Playbook } {
  const playbook = getPublicPlaybook(slug);
  if (!playbook) throw notFound();
  return { playbook };
}

export function publicPlaybookHead(slug: string) {
  return ({ loaderData }: { loaderData?: { playbook: Playbook } }) => {
    const title = loaderData?.playbook.title_en ?? 'Playbook';
    return {
      meta: [
        { title: `${title} — Shenzhen Copilot` },
        { name: 'description', content: loaderData?.playbook.summary_en ?? '' },
      ],
      links: [{ rel: 'canonical', href: `${envConfigs.app_url}/p/${slug}` }],
    };
  };
}

export function PublicPlaybookPage({ playbook }: { playbook: Playbook }) {
  return (
    <CopilotChrome>
      <PlaybookView
        playbook={playbook}
        profile={EMPTY_PROFILE}
        mode="public"
        loginNext={`/run/${playbook.id}`}
      />
    </CopilotChrome>
  );
}
