import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/hospital-rabies')({
  loader: () => loadPublicPlaybook('hospital-rabies'),
  head: publicPlaybookHead('hospital-rabies'),
  component: function Page() {
    const { playbook, freshness } = Route.useLoaderData();
    return <PublicPlaybookPage playbook={playbook} freshness={freshness} />;
  },
});
