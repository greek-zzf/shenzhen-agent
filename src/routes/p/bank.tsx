import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/bank')({
  loader: () => loadPublicPlaybook('bank'),
  head: publicPlaybookHead('bank'),
  component: function Page() {
    const { playbook, freshness } = Route.useLoaderData();
    return <PublicPlaybookPage playbook={playbook} freshness={freshness} />;
  },
});
