import { useEffect, useRef } from 'react';

import { useSession } from '@/core/auth/client';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { safeNextPath } from '@/lib/playbooks/safe-next';

export function CopilotAuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  // Redirect once: the gate stays mounted while /login loads, and a second
  // pass would read /login as the page to come back to.
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (session?.user) return;
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    const next = safeNextPath(pathname);
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [isPending, session, pathname, router]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
