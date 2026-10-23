import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PlaybookView } from '@/components/copilot/playbook-view';
import { attachPlaybooks } from '@/lib/playbooks/attach';
import { getPlaybook, PLAYBOOKS } from '@/lib/playbooks/catalog';
import { getNiaEligibilityFn } from '@/lib/playbooks/get-nia-eligibility';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/get-freshness';
import type { NiaEligibility } from '@/lib/playbooks/nia-eligibility';
import { loadProfile, saveProfile } from '@/lib/playbooks/profile';

function RunPage() {
  const { playbook, freshness, niaEligibility } = Route.useLoaderData();
  const [profile, setProfile] = useState(() => loadProfile());
  const attachedIds = useMemo(
    () => attachPlaybooks(profile, PLAYBOOKS).map((pb) => pb.id),
    [profile]
  );

  return (
    <PlaybookView
      playbook={playbook}
      profile={profile}
      mode="run"
      attachedIds={attachedIds}
      freshness={freshness}
      niaEligibility={niaEligibility}
      onProfileChange={(next) => {
        saveProfile(next);
        setProfile(next);
      }}
    />
  );
}

export const Route = createFileRoute('/(copilot)/run/$playbookId')({
  loader: async ({ params }) => {
    const playbook = getPlaybook(params.playbookId);
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
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.playbook.title_en} — Shenzhen Copilot`
          : 'Playbook',
      },
    ],
  }),
  component: RunPage,
});
