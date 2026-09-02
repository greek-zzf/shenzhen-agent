import { notFound } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { PlaybookView } from '@/components/copilot/playbook-view';
import { envConfigs } from '@/config';
import { getPublicPlaybook } from '@/lib/playbooks/catalog';
import type { PlaybookFreshness } from '@/lib/playbooks/freshness';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/get-freshness';
import { EMPTY_PROFILE } from '@/lib/playbooks/profile';
import { buildPublicPlaybookHead } from '@/lib/playbooks/public-seo';
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
  return () => buildPublicPlaybookHead(slug, envConfigs.app_url);
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
