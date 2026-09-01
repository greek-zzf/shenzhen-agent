import { Link, usePathname } from '@/core/i18n/navigation';
import { useSession } from '@/core/auth/client';
import { cn } from '@/lib/utils';
import { BookOpen, Home, User } from 'lucide-react';

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            {WORDMARK}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/library"
              className={cn(
                'hidden sm:inline text-muted-foreground hover:text-foreground',
                pathname.startsWith('/library') && 'text-foreground font-medium'
              )}
            >
              Library
            </Link>
            {user ? (
              <Link
                href="/me"
                className={cn(
                  'text-muted-foreground hover:text-foreground',
                  pathname.startsWith('/me') && 'text-foreground font-medium'
                )}
              >
                Me
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname === '/' ? '/intake' : pathname)}`}
                className="font-medium underline underline-offset-4"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={cn('mx-auto w-full max-w-lg px-4 pb-24 pt-6', className)}>
        {children}
      </main>

      <nav
        aria-label="Copilot"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3">
          <BottomLink href="/" label="Home" icon={Home} active={pathname === '/'} />
          <BottomLink
            href="/library"
            label="Library"
            icon={BookOpen}
            active={pathname.startsWith('/library')}
          />
          <BottomLink
            href={user ? '/me' : `/login?next=${encodeURIComponent('/me')}`}
            label="Me"
            icon={User}
            active={pathname.startsWith('/me')}
          />
        </div>
      </nav>
    </div>
  );
}

function BottomLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
        active ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
