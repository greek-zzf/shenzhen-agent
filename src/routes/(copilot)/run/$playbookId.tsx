import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PlaybookView } from '@/components/copilot/playbook-view';
import { getPlaybook, PLAYBOOKS } from '@/lib/playbooks/catalog';
import { attachPlaybooks } from '@/lib/playbooks/attach';
import { loadProfile } from '@/lib/playbooks/profile';

function RunPage() {
  const { playbook } = Route.useLoaderData();
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
    />
  );
}

export const Route = createFileRoute('/(copilot)/run/$playbookId')({
  loader: ({ params }) => {
    const playbook = getPlaybook(params.playbookId);
    if (!playbook) throw notFound();
    return { playbook };
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
