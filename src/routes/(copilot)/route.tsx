import { createFileRoute, Outlet } from '@tanstack/react-router';

import { CopilotChrome } from '@/components/copilot/chrome';

export const Route = createFileRoute('/(copilot)')({
  component: CopilotLayout,
});

/** Open to everyone. Only /me (and the email reminder) need an account. */
function CopilotLayout() {
  return (
    <CopilotChrome>
      <Outlet />
    </CopilotChrome>
  );
}
