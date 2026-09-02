import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PlaybookView } from '@/components/copilot/playbook-view';
import { attachPlaybooks } from '@/lib/playbooks/attach';
import { getGuidanceAssistStatusFn } from '@/lib/playbooks/ask-guidance';
import { getPlaybook, PLAYBOOKS } from '@/lib/playbooks/catalog';
import { getPlaybookFreshnessFn } from '@/lib/playbooks/get-freshness';
import { loadProfile } from '@/lib/playbooks/profile';

function RunPage() {
  const { playbook, freshness, assistAvailable } = Route.useLoaderData();
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
      assistAvailable={assistAvailable}
    />
  );
}

export const Route = createFileRoute('/(copilot)/run/$playbookId')({
  loader: async ({ params }) => {
    const playbook = getPlaybook(params.playbookId);
    if (!playbook) throw notFound();
    const [freshness, assist] = await Promise.all([
      getPlaybookFreshnessFn({
        data: { playbookId: playbook.id },
      }),
      getGuidanceAssistStatusFn(),
    ]);
    return { playbook, freshness, assistAvailable: assist.available };
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
