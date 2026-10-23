import { Link, usePathname } from '@/core/i18n/navigation';
import { useSession } from '@/core/auth/client';
import { cn } from '@/lib/utils';

import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@/styles/home-lawn.css';

const WORDMARK = 'Shenzhen Copilot';

export function CopilotChrome({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  return (
    <div className="lawn-shell flex min-h-svh flex-col">
      <header className="px-4 pt-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Shenzhen Copilot"
          className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 rounded-full bg-white px-5 shadow-[0_8px_24px_rgba(47,49,48,0.08)]"
        >
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap text-[15px] font-semibold tracking-tight"
          >
            {WORDMARK}
          </Link>
          <div className="ml-auto flex items-center gap-5">
            <Link
              href="/library"
              className="lawn-nav-link"
              data-active={pathname.startsWith('/library') ? 'true' : undefined}
            >
              Library
            </Link>
            {user ? (
              <Link
                href="/me"
                className="lawn-nav-link"
                data-active={pathname.startsWith('/me') ? 'true' : undefined}
              >
                Me
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname === '/' ? '/intake' : pathname)}`}
                className="lawn-nav-link"
                data-active={pathname.startsWith('/login') ? 'true' : undefined}
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main
        className={cn(
          'lawn-slab relative mt-8 flex-1 px-4 py-10 sm:px-10 sm:py-12 lg:px-12',
          className
        )}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
