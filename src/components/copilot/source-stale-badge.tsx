import { Badge } from '@/components/ui/badge';

export function SourceStaleBadge({ lastVerified }: { lastVerified: string | null }) {
  if (lastVerified) {
    return (
      <Badge variant="outline" className="border-border font-normal">
        Verified {lastVerified}
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className="rounded-md font-medium"
      title="Draft SOP. Never pretend this is field-verified."
    >
      Draft SOP — not field-verified
    </Badge>
  );
}
