import { sourceMaxAgeDaysFor } from './freshness';
import { parsePlaybookYaml } from './parse';
import type { Playbook } from './schema';

const rawFiles = import.meta.glob('/src/content/sops/pb-*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function loadCatalog(): Playbook[] {
  const playbooks = Object.entries(rawFiles).map(([path, raw]) =>
    parsePlaybookYaml(raw, path)
  );
  playbooks.sort((a, b) => a.id.localeCompare(b.id));
  return playbooks;
}

export const PLAYBOOKS: Playbook[] = loadCatalog();

export const PLAYBOOK_BY_ID: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((pb) => [pb.id, pb])
);

export const PLAYBOOK_BY_PUBLIC_SLUG: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.filter((pb) => pb.public_slug).map((pb) => [pb.public_slug as string, pb])
);

export const REQUIRED_PLAYBOOK_IDS = [
  'pb-01',
  'pb-02',
  'pb-03',
  'pb-04',
  'pb-05',
  'pb-10',
] as const;

export function getPlaybook(id: string): Playbook | null {
  return PLAYBOOK_BY_ID[id] ?? null;
}

export function getPublicPlaybook(slug: string): Playbook | null {
  return PLAYBOOK_BY_PUBLIC_SLUG[slug] ?? null;
}

export function assertCatalogComplete(): void {
  const missing = REQUIRED_PLAYBOOK_IDS.filter((id) => !PLAYBOOK_BY_ID[id]);
  if (missing.length) {
    throw new Error(`Missing required playbooks: ${missing.join(', ')}`);
  }
  for (const pb of PLAYBOOKS) {
    if (pb.last_verified !== null) {
      throw new Error(`${pb.id} last_verified must be null in v1 draft SOPs`);
    }
    const expectedAge = sourceMaxAgeDaysFor(pb.id);
    if (pb.source_max_age_days !== expectedAge) {
      throw new Error(
        `${pb.id} source_max_age_days must be ${expectedAge} (got ${pb.source_max_age_days})`
      );
    }
  }
}

assertCatalogComplete();
