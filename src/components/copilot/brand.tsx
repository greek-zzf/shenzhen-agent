import { cn } from '@/lib/utils';

/**
 * Three steps going up: tomato → cobalt → violet, the homepage disc colours.
 * Asset copies live in public/brand/ (mark.svg, lockup.svg, app-icon.svg).
 */
export function BrandMark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-7 shrink-0', className)}>
      <circle cx="14" cy="48" r="10" fill="#FE6255" />
      <circle cx="32" cy="32" r="10" fill={onDark ? '#4B93F5' : '#116DE8'} />
      <circle cx="50" cy="16" r="10" fill={onDark ? '#A27BD0' : '#5D308D'} />
    </svg>
  );
}

/** Mark + "How to Shenzhen" for nav bars. Text stays live so it scales and translates. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[15px] tracking-tight',
        className
      )}
    >
      <BrandMark />
      <span>
        <span className="font-medium">How to </span>
        <span className="font-semibold">Shenzhen</span>
      </span>
    </span>
  );
}
