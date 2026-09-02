import { createFileRoute } from '@tanstack/react-router';

import {
  loadPublicPlaybook,
  PublicPlaybookPage,
  publicPlaybookHead,
} from './-public-playbook';

export const Route = createFileRoute('/p/alipay-metro')({
  loader: () => loadPublicPlaybook('alipay-metro'),
  head: publicPlaybookHead('alipay-metro'),
  component: function Page() {
    const { playbook, freshness } = Route.useLoaderData();
    return <PublicPlaybookPage playbook={playbook} freshness={freshness} />;
  },
});
