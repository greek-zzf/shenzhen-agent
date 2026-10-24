import { Copy, Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Category → disc colour, the same discs as the homepage situations. */
export const GUIDE_DISC: Record<string, string> = {
  food: '#FE6255',
  coffee: '#116DE8',
  tips: '#5D308D',
};

export function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm font-semibold tabular-nums', className)}
      aria-label={`Felix's rating ${rating} out of 5`}
    >
      <Star className="size-3.5 fill-current" aria-hidden />
      {rating.toFixed(1)}
    </span>
  );
}

/** Hanzi line you show a driver or paste into a map app. */
export function CopyLine({ label, zh, en }: { label: string; zh: string; en?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(zh);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p className="text-lg font-semibold leading-8 text-foreground" lang="zh-CN">
          {zh}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={copy} className="shrink-0">
          <Copy className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {en && <p className="mt-1 text-sm leading-6 text-muted-foreground">{en}</p>}
    </div>
  );
}
