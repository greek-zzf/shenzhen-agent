import { PLAYBOOKS } from '@/lib/playbooks/catalog';

import { buildCorpus } from './build';
import type { AgentCorpus, CorpusFile } from './types';

const researchMd = import.meta.glob('../../../docs/field-research/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, unknown>;

const researchCsv = import.meta.glob('../../../docs/field-research/**/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, unknown>;

const verificationFiles = import.meta.glob('../../../docs/field-verification*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, unknown>;

function asText(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (
    raw &&
    typeof raw === 'object' &&
    'default' in raw &&
    typeof (raw as { default: unknown }).default === 'string'
  ) {
    return (raw as { default: string }).default;
  }
  return '';
}

function fromGlob(map: Record<string, unknown>): CorpusFile[] {
  return Object.entries(map)
    .map(([path, raw]) => {
      const normalized = path
        .replace(/\\/g, '/')
        .replace(/^.*\/(docs\/)/, '$1')
        .replace(/\?.*$/, '');
      return { path: normalized, text: asText(raw) };
    })
    .filter((file) => file.text.length > 0);
}

export function loadDocFilesVite(): CorpusFile[] {
  return [
    ...fromGlob(researchMd),
    ...fromGlob(researchCsv),
    ...fromGlob(verificationFiles),
  ];
}

let cached: AgentCorpus | null = null;

export function getViteCorpus(): AgentCorpus {
  if (!cached) cached = buildCorpus(loadDocFilesVite(), PLAYBOOKS);
  return cached;
}
