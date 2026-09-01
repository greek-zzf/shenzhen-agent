import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/accommodation-registration')({
  loader: () => loadPublicPlaybook('accommodation-registration'),
  head: publicPlaybookHead('accommodation-registration'),
  component: function Page() {
    const { playbook } = Route.useLoaderData();
    return <PublicPlaybookPage playbook={playbook} />;
  },
});
