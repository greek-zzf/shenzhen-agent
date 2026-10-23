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
      title="A draft guide. Nobody has walked these steps in person yet — confirm at the counter."
    >
      Draft — not checked in person
    </Badge>
  );
}
