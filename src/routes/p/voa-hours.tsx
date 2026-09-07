import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/voa-hours')({
  loader: () => loadPublicPlaybook('voa-hours'),
  head: publicPlaybookHead('voa-hours'),
  component: function Page() {
    const { playbook, freshness, niaEligibility } = Route.useLoaderData();
    return (
      <PublicPlaybookPage
        playbook={playbook}
        freshness={freshness}
        niaEligibility={niaEligibility}
      />
    );
  },
});
