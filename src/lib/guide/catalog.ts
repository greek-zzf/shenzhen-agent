// Felix's Shenzhen guide — food, coffee and tips imported from the
// digital-garden vault by scripts/import-guide.mjs. Bundled at build time.
import { parse as parseYaml } from 'yaml';

export const GUIDE_CATEGORIES = ['food', 'coffee', 'tips'] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const GUIDE_CATEGORY_LABEL: Record<GuideCategory, string> = {
  food: 'Food',
  coffee: 'Coffee',
  tips: 'Tips',
};

/** Areas in the order a newcomer usually meets them. */
export const GUIDE_AREAS = ['Nanshan', 'Shekou', 'Futian', "Bao'an", 'Luohu'] as const;

export interface GuideEntry {
  slug: string;
  category: GuideCategory;
  title: string;
  title_zh?: string;
  area?: string;
  address?: string;
  address_zh?: string;
  metro?: string;
  metro_zh?: string;
  location_note?: string;
  rating?: number;
  rating_note?: string;
  good_for?: string[];
  closed?: boolean;
  summary: string;
  photos: string[];
  source?: string;
  updated?: string;
  body: string;
}

const rawFiles = import.meta.glob('/src/content/guide/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseEntry(path: string, raw: string): GuideEntry {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Guide entry without frontmatter: ${path}`);
  const meta = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const category = meta.category as GuideCategory;
  if (!GUIDE_CATEGORIES.includes(category)) {
    throw new Error(`Unknown guide category "${String(meta.category)}" in ${path}`);
  }
  return {
    ...(meta as Omit<GuideEntry, 'slug' | 'body' | 'photos'>),
    slug,
    category,
    title: String(meta.title ?? slug),
    summary: String(meta.summary ?? ''),
    photos: Array.isArray(meta.photos) ? (meta.photos as string[]) : [],
    body: match[2].trim(),
  };
}

/** Open places first, then by rating (high → low), then by title. */
function compare(a: GuideEntry, b: GuideEntry) {
  if (!!a.closed !== !!b.closed) return a.closed ? 1 : -1;
  const r = (b.rating ?? 0) - (a.rating ?? 0);
  return r !== 0 ? r : a.title.localeCompare(b.title);
}

export const GUIDE_ENTRIES: GuideEntry[] = Object.entries(rawFiles)
  .map(([path, raw]) => parseEntry(path, raw))
  .sort(compare);

export const GUIDE_BY_SLUG: Record<string, GuideEntry> = Object.fromEntries(
  GUIDE_ENTRIES.map((e) => [e.slug, e])
);

export function guideCounts() {
  return Object.fromEntries(
    GUIDE_CATEGORIES.map((c) => [c, GUIDE_ENTRIES.filter((e) => e.category === c).length])
  ) as Record<GuideCategory, number>;
}
