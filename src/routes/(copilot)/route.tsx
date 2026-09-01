import { createFileRoute, Outlet } from '@tanstack/react-router';

import { CopilotAuthGate } from '@/components/copilot/auth-gate';
import { CopilotChrome } from '@/components/copilot/chrome';

export const Route = createFileRoute('/(copilot)')({
  component: CopilotAuthedLayout,
});

function CopilotAuthedLayout() {
  return (
    <CopilotChrome>
      <CopilotAuthGate>
        <Outlet />
      </CopilotAuthGate>
    </CopilotChrome>
  );
}
