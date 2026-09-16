import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import type { CorpusFile } from './types';

function walkFiles(dir: string, match: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, match));
    } else if (match(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Request-time / test loader. Vite runtime prefers `load-vite.ts` so Workers
 * bundles keep the files without touching the filesystem.
 */
export function loadCorpusFilesFromDisk(root = process.cwd()): CorpusFile[] {
  const sopDir = join(root, 'src/content/sops');
  const researchDir = join(root, 'docs/field-research');
  const docsDir = join(root, 'docs');

  const paths = [
    ...walkFiles(sopDir, (name) => /^pb-\d{2}.*\.ya?ml$/i.test(name)),
    ...walkFiles(researchDir, (name) => /\.(md|csv)$/i.test(name)),
    ...walkFiles(
      docsDir,
      (name) => /^field-verification.*\.md$/i.test(name)
    ),
  ];

  const seen = new Set<string>();
  const files: CorpusFile[] = [];
  for (const abs of paths) {
    const rel = relative(root, abs).replace(/\\/g, '/');
    if (seen.has(rel)) continue;
    seen.add(rel);
    files.push({ path: rel, text: readFileSync(abs, 'utf8') });
  }
  return files;
}
