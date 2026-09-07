import { notFound } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';
import { PlaybookView } from '@/components/copilot/playbook-view';
import { envConfigs } from '@/config';
import { getPublicPlaybook } from '@/lib/playbooks/catalog';
import type { PlaybookFreshness } from '@/lib/playbooks/freshness';
import { getNiaEligibilityFn } from '@/lib/playbooks/get-nia-eligibility';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/get-freshness';
import type { NiaEligibility } from '@/lib/playbooks/nia-eligibility';
import { EMPTY_PROFILE } from '@/lib/playbooks/profile';
import { buildPublicPlaybookHead } from '@/lib/playbooks/public-seo';
import type { Playbook } from '@/lib/playbooks/schema';

export async function loadPublicPlaybook(slug: string): Promise<{
  playbook: Playbook;
  freshness: PlaybookFreshness;
  niaEligibility: NiaEligibility | null;
}> {
  const playbook = getPublicPlaybook(slug);
  if (!playbook) throw notFound();
  const [freshness, niaEligibility] = await Promise.all([
    getPlaybookFreshnessFn({
      data: { playbookId: playbook.id },
    }),
    playbook.id === 'pb-03'
      ? getNiaEligibilityFn()
      : Promise.resolve(null as NiaEligibility | null),
  ]);
  return { playbook, freshness, niaEligibility };
}

export function publicPlaybookHead(slug: string) {
  return () => buildPublicPlaybookHead(slug, envConfigs.app_url);
}

export function PublicPlaybookPage({
  playbook,
  freshness,
  niaEligibility = null,
}: {
  playbook: Playbook;
  freshness: PlaybookFreshness;
  niaEligibility?: NiaEligibility | null;
}) {
  return (
    <CopilotChrome>
      <PlaybookView
        playbook={playbook}
        profile={EMPTY_PROFILE}
        mode="public"
        loginNext={`/run/${playbook.id}`}
        freshness={freshness}
        niaEligibility={niaEligibility}
      />
    </CopilotChrome>
  );
}
