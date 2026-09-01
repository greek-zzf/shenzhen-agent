import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PlaybookView } from '@/components/copilot/playbook-view';
import { attachPlaybooks } from '@/lib/playbooks/attach';
import { getPlaybook, PLAYBOOKS } from '@/lib/playbooks/catalog';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/freshness.server';
import { loadProfile } from '@/lib/playbooks/profile';

function RunPage() {
  const { playbook, freshness } = Route.useLoaderData();
  const [profile] = useState(() => loadProfile());
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
    />
  );
}

export const Route = createFileRoute('/(copilot)/run/$playbookId')({
  loader: async ({ params }) => {
    const playbook = getPlaybook(params.playbookId);
    if (!playbook) throw notFound();
    const freshness = await getPlaybookFreshnessFn({
      data: { playbookId: playbook.id },
    });
    return { playbook, freshness };
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
