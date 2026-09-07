import { createFileRoute } from '@tanstack/react-router';

import { HrLetterPreview } from '@/components/copilot/hr-letter-preview';
import { Button } from '@/components/ui/button';
import { Link } from '@/core/i18n/navigation';
import { getHrMaterialsExcerptFn } from '@/lib/playbooks/get-hr-materials';
import type { HrMaterialsExcerpt } from '@/lib/playbooks/hr-materials';

function HrLetterPage() {
  const { excerpt } = Route.useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <Link href="/run/pb-10" className="text-sm underline underline-offset-4">
          Back to pb-10
        </Link>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <HrLetterPreview excerpt={excerpt} />
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/run/pb-10/hr-letter')({
  loader: async (): Promise<{ excerpt: HrMaterialsExcerpt }> => {
    const excerpt = await getHrMaterialsExcerptFn();
    return { excerpt };
  },
  head: () => ({
    meta: [{ title: 'HR stay note — Shenzhen Copilot' }],
  }),
  component: HrLetterPage,
});
