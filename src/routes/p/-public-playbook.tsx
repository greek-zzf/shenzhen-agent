import { notFound } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { PlaybookView } from '@/components/copilot/playbook-view';
import { envConfigs } from '@/config';
import { getPublicPlaybook } from '@/lib/playbooks/catalog';
import type { PlaybookFreshness } from '@/lib/playbooks/freshness';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/freshness.server';
import { EMPTY_PROFILE } from '@/lib/playbooks/profile';
import type { Playbook } from '@/lib/playbooks/schema';

export async function loadPublicPlaybook(slug: string): Promise<{
  playbook: Playbook;
  freshness: PlaybookFreshness;
}> {
  const playbook = getPublicPlaybook(slug);
  if (!playbook) throw notFound();
  const freshness = await getPlaybookFreshnessFn({
    data: { playbookId: playbook.id },
  });
  return { playbook, freshness };
}

export function publicPlaybookHead(slug: string) {
  return ({
    loaderData,
  }: {
    loaderData?: { playbook: Playbook; freshness?: PlaybookFreshness };
  }) => {
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

export function PublicPlaybookPage({
  playbook,
  freshness,
}: {
  playbook: Playbook;
  freshness: PlaybookFreshness;
}) {
  return (
    <CopilotChrome>
      <PlaybookView
        playbook={playbook}
        profile={EMPTY_PROFILE}
        mode="public"
        loginNext={`/run/${playbook.id}`}
        freshness={freshness}
      />
    </CopilotChrome>
  );
}
