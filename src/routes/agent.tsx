import { createFileRoute } from '@tanstack/react-router';

import { AgentChat } from '@/components/copilot/agent-chat';
import { CopilotChrome } from '@/components/copilot/chrome';
import { envConfigs } from '@/config';
import { AGENT_FRAMING } from '@/lib/agent-corpus/types';

function AgentPage() {
  return (
    <CopilotChrome>
      <AgentChat />
    </CopilotChrome>
  );
}

export const Route = createFileRoute('/agent')({
  head: () => ({
    meta: [
      { title: 'Errands agent — Shenzhen Copilot' },
      { name: 'description', content: AGENT_FRAMING },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/agent` }],
  }),
  component: AgentPage,
});
