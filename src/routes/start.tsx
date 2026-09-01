import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/start')({
  beforeLoad: () => {
    throw redirect({ to: '/intake' });
  },
  component: function StartRedirect() {
    return null;
  },
});
