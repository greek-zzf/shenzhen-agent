/**
 * Static English SEO chrome for the three public playbook URLs.
 * Titles and descriptions are authored here — never fetched from .gov.cn,
 * and never copied from YAML fields that may later name hours or fees.
 */

import type { PublicSlug } from './schema';

export const SITE_NAME = 'Shenzhen Copilot';

/** v1 ranking / sitemap URLs — expansion drafts have slugs + SEO but stay off this list. */
export const PUBLIC_PLAYBOOK_SLUGS = [
  'voa-hours',
  'alipay-metro',
  'accommodation-registration',
] as const;

export type RankingPlaybookSlug = (typeof PUBLIC_PLAYBOOK_SLUGS)[number];
export type PublicPlaybookSlug = PublicSlug;

export type PublicPlaybookSeo = {
  slug: PublicPlaybookSlug;
  path: `/${string}`;
  title: string;
  description: string;
};

export const PUBLIC_PLAYBOOK_SEO: Record<
  PublicPlaybookSlug,
  PublicPlaybookSeo
> = {
  'voa-hours': {
    slug: 'voa-hours',
    path: '/p/voa-hours',
    title: 'Shenzhen visa on arrival hours — Shenzhen Copilot',
    description:
      'Published Shenzhen visa-on-arrival hours conflict with traveler reports. This draft playbook shows both claims and tells you to confirm at the window. No invented hours or fees.',
  },
  'alipay-metro': {
    slug: 'alipay-metro',
    path: '/p/alipay-metro',
    title: 'Alipay metro for foreigners — Shenzhen Copilot',
    description:
      'How foreigners ride Shenzhen metro with Alipay Transport or WeChat Pay. Skip the metro mini-program. Cash token is the backup. Draft SOP — not a payment promise.',
  },
  'accommodation-registration': {
    slug: 'accommodation-registration',
    path: '/p/accommodation-registration',
    title: 'Temporary accommodation registration Shenzhen — Shenzhen Copilot',
    description:
      'Hotels register you; an apartment does not. You have 24 hours. Scan the house QR, skip iShenzhen face, and verify at the window. This copilot never submits the form.',
  },
  bank: {
    slug: 'bank',
    path: '/p/bank',
    title: 'Mainland bank account Shenzhen — Shenzhen Copilot',
    description:
      'Draft playbook: visa refuse prediction, materials list, guide-named branch areas with no invented streets. Airport one-stop is not a bank SLA. Never a proxy account or underground FX.',
  },
  'housing-lease': {
    slug: 'housing-lease',
    path: '/p/housing-lease',
    title: 'Shenzhen housing lease and online filing — Shenzhen Copilot',
    description:
      'Draft playbook: treat 58.com as a listing trap, commission figures conflict, file the city lease record, copy fields for 24-hour registration. Never a fake residence slip.',
  },
  'hospital-rabies': {
    slug: 'hospital-rabies',
    path: '/p/hospital-rabies',
    title: 'Shenzhen rabies and public hospital routing — Shenzhen Copilot',
    description:
      'Draft playbook: a bite means the nearest public emergency desk now. HKU-Shenzhen Hospital phones are listed. Passport WeChat booking often fails. This copilot never diagnoses, prescribes, or books via RPA.',
  },
  'work-residence': {
    slug: 'work-residence',
    path: '/p/work-residence',
    title: 'Shenzhen work permit and residence permit checklist — Shenzhen Copilot',
    description:
      'Draft playbook: the employer files. Personal materials plus the official URL. Age-policy notes are a conflict, not a product step. No fake employer and no visa-run.',
  },
};

export const PUBLIC_PLAYBOOK_PATHS: ReadonlyArray<`/${string}`> =
  PUBLIC_PLAYBOOK_SLUGS.map((slug) => PUBLIC_PLAYBOOK_SEO[slug].path);

export function isPublicPlaybookSlug(slug: string): slug is PublicPlaybookSlug {
  return slug in PUBLIC_PLAYBOOK_SEO;
}

export function getPublicPlaybookSeo(slug: string): PublicPlaybookSeo | null {
  return isPublicPlaybookSlug(slug) ? PUBLIC_PLAYBOOK_SEO[slug] : null;
}

export function publicPlaybookCanonical(slug: string, appUrl: string): string {
  const base = appUrl.replace(/\/$/, '');
  const seo = getPublicPlaybookSeo(slug);
  return `${base}${seo?.path ?? `/p/${slug}`}`;
}

export type HeadMetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export type PublicPlaybookHeadResult = {
  meta: HeadMetaTag[];
  links: { rel: string; href: string }[];
};

/** Document title, meta description, canonical, and Open Graph — English only. */
export function buildPublicPlaybookHead(
  slug: string,
  appUrl: string
): PublicPlaybookHeadResult {
  const seo = getPublicPlaybookSeo(slug);
  const title = seo?.title ?? `${SITE_NAME}`;
  const description = seo?.description ?? '';
  const canonical = publicPlaybookCanonical(slug, appUrl);

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'en_US' },
    ],
    links: [{ rel: 'canonical', href: canonical }],
  };
}
