import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';

function PoisPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Saved POIs</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Stub. Copy-name Chinese from a playbook lives on the run screen. A
        personal map comes later — we will not invent hall street addresses here.
      </p>
      <Link href="/me" className="text-sm underline underline-offset-4">
        Back to Me
      </Link>
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/me/pois')({
  component: PoisPage,
});
