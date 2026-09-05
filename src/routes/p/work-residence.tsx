import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/work-residence')({
  loader: () => loadPublicPlaybook('work-residence'),
  head: publicPlaybookHead('work-residence'),
  component: function Page() {
    const { playbook, freshness } = Route.useLoaderData();
    return <PublicPlaybookPage playbook={playbook} freshness={freshness} />;
  },
});
