import { buildCorpus } from './build';
import type { AgentCorpus, CorpusFile } from './types';

const sopFiles = import.meta.glob('/src/content/sops/pb-*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const researchMd = import.meta.glob('/docs/field-research/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const researchCsv = import.meta.glob('/docs/field-research/**/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const verificationFiles = import.meta.glob('/docs/field-verification*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function fromGlob(map: Record<string, string>): CorpusFile[] {
  return Object.entries(map).map(([path, text]) => ({
    path: path.replace(/^\//, ''),
    text,
  }));
}

export function loadCorpusFilesVite(): CorpusFile[] {
  return [
    ...fromGlob(sopFiles),
    ...fromGlob(researchMd),
    ...fromGlob(researchCsv),
    ...fromGlob(verificationFiles),
  ];
}

let cached: AgentCorpus | null = null;

export function getViteCorpus(): AgentCorpus {
  if (!cached) cached = buildCorpus(loadCorpusFilesVite());
  return cached;
}
