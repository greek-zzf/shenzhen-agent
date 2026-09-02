import { Banknote, BookUser, Clock } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { useSession } from '@/core/auth/client';

import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@/styles/home-lawn.css';

const SITUATIONS = [
  {
    href: '/p/alipay-metro',
    label: "Can't pay",
    disc: 'var(--lawn-tomato)',
    Icon: Banknote,
  },
  {
    href: '/p/voa-hours',
    label: '5-day VOA',
    disc: 'var(--lawn-cobalt)',
    Icon: BookUser,
  },
  {
    href: '/p/accommodation-registration',
    label: '24h register',
    disc: 'var(--lawn-violet)',
    Icon: Clock,
  },
] as const;

export function HomeLawn() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="home-lawn relative isolate flex flex-col overflow-x-clip">
      <PaperShards />

      <header className="relative z-10 px-4 pt-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Shenzhen Copilot"
          className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-full bg-white px-5 shadow-[0_8px_24px_rgba(47,49,48,0.08)]"
        >
          <Link href="/" className="shrink-0 whitespace-nowrap text-[15px] font-semibold tracking-tight">
            Shenzhen Copilot
          </Link>
          <div className="ml-auto flex items-center gap-5">
            <Link href="/library" className="shrink-0 whitespace-nowrap text-[15px] font-medium tracking-tight">
              Library
            </Link>
            <Link
              href={user ? '/me' : '/login?next=/intake'}
              className="shrink-0 whitespace-nowrap text-[15px] font-medium tracking-tight"
            >
              {user ? 'Me' : 'Log in'}
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-4 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="home-lawn-headline">
          English playbooks for the window, not another Shenzhen guidebook.
        </h1>

        <ul className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4">
          {SITUATIONS.map((item) => (
            <li key={item.href} className="sm:flex-none">
              <Link href={item.href} className="home-lawn-pill">
                <span
                  className="home-lawn-disc"
                  style={{ background: item.disc }}
                  aria-hidden
                >
                  <item.Icon className="size-6" strokeWidth={2.2} />
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <section className="home-lawn-slab relative z-10 mt-8 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Link href="/login?next=/intake" className="home-lawn-passport">
            Start with my passport →
          </Link>
          <p className="text-[13px] font-medium text-[color:color-mix(in_oklab,var(--lawn-ink)_70%,var(--lawn-cream))]">
            <Link href="/disclaimer" className="underline-offset-4 hover:underline">
              Disclaimer
            </Link>
            {' · '}
            <Link
              href="/unsupported-city"
              className="underline-offset-4 hover:underline"
            >
              Not Shenzhen?
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function PaperShards() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-[-4%] bottom-[18%] z-0 hidden h-[min(52vh,28rem)] w-[min(46vw,32rem)] sm:block"
      viewBox="0 0 420 360"
      fill="none"
    >
      <rect
        x="210"
        y="40"
        width="170"
        height="220"
        rx="28"
        fill="#F4F0E6"
        transform="rotate(18 295 150)"
      />
      <rect
        x="160"
        y="90"
        width="150"
        height="190"
        rx="24"
        fill="#E8D5D0"
        transform="rotate(-8 235 185)"
      />
      <rect
        x="250"
        y="130"
        width="140"
        height="170"
        rx="22"
        fill="#D7E8D4"
        transform="rotate(12 320 215)"
      />
      <rect
        x="80"
        y="160"
        width="180"
        height="140"
        rx="26"
        fill="#F7F3EA"
        transform="rotate(-16 170 230)"
      />
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx={300 + (i % 5) * 18}
          cy={70 + Math.floor(i / 5) * 22}
          r="5"
          fill="#F7F3EA"
          opacity="0.95"
        />
      ))}
    </svg>
  );
}
