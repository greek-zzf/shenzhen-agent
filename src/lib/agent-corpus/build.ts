import { parsePlaybookYaml } from '@/lib/playbooks/parse';
import type { OfficialUrl, Playbook, UrlKind } from '@/lib/playbooks/schema';

import { tokenize } from './tokenize';
import {
  REDDIT_1T9YELI,
  type AgentChunk,
  type AgentCorpus,
  type AgentSource,
  type AgentSourceKind,
  type CorpusFile,
} from './types';

function mapUrlKind(kind: UrlKind): Exclude<AgentSourceKind, 'sop' | 'docs'> {
  return kind === 'official' ? 'official' : 'user_report';
}

function sourceId(kind: string, key: string): string {
  return `${kind}:${key}`.slice(0, 180);
}

function officialToSource(item: OfficialUrl): AgentSource {
  return {
    id: sourceId(mapUrlKind(item.kind), item.url),
    title: item.label,
    kind: mapUrlKind(item.kind),
    url: item.url,
    date: item.fetched_at ?? undefined,
  };
}

function sopPlaybookSource(playbook: Playbook): AgentSource {
  return {
    id: sourceId('sop', playbook.id),
    title: playbook.title_en,
    kind: 'sop',
    url: `/run/${playbook.id}`,
  };
}

function uniqueSources(sources: AgentSource[]): AgentSource[] {
  const seen = new Set<string>();
  const out: AgentSource[] = [];
  for (const source of sources) {
    if (!source.url || seen.has(source.id)) continue;
    seen.add(source.id);
    out.push(source);
  }
  return out;
}

function chunkOf(input: {
  id: string;
  title: string;
  text: string;
  kind: AgentSourceKind;
  playbookId?: string;
  sources: AgentSource[];
  conflictSides?: AgentChunk['conflictSides'];
}): AgentChunk {
  const text = input.text.replace(/\s+/g, ' ').trim();
  return {
    id: input.id,
    title: input.title,
    text,
    kind: input.kind,
    playbookId: input.playbookId,
    tokens: tokenize(`${input.title} ${text}`),
    sources: uniqueSources(input.sources),
    conflictSides: input.conflictSides,
  };
}

function chunksFromPlaybook(playbook: Playbook, path: string): AgentChunk[] {
  const sop = sopPlaybookSource(playbook);
  const topUrls = playbook.official_urls.map(officialToSource);
  const chunks: AgentChunk[] = [];

  chunks.push(
    chunkOf({
      id: `sop:${playbook.id}:overview`,
      title: playbook.title_en,
      text: [
        playbook.summary_en,
        playbook.disclaimer_en,
        `status: ${playbook.status}`,
        `last_verified: ${playbook.last_verified ?? 'null'}`,
        `YAML: ${path}`,
      ].join('\n'),
      kind: 'sop',
      playbookId: playbook.id,
      sources: [sop, ...topUrls],
    })
  );

  for (const step of playbook.steps) {
    const bring = step.what_to_bring
      .map((item) => `${item.required ? 'required' : 'optional'}: ${item.label_en}`)
      .join('; ');
    const click = step.click_path
      ? step.click_path.steps.map((item) => `${item.n}. ${item.text_en}`).join(' ')
      : '';
    chunks.push(
      chunkOf({
        id: `sop:${playbook.id}:step:${step.id}`,
        title: `${playbook.title_en} — ${step.title_en}`,
        text: [step.why, bring, click, step.stuck_node]
          .filter(Boolean)
          .join('\n'),
        kind: 'sop',
        playbookId: playbook.id,
        sources: [sop, ...step.official_urls.map(officialToSource), ...topUrls],
      })
    );
  }

  for (const conflict of playbook.conflicts) {
    const sides = conflict.sources.map((source, index) => {
      const mapped = officialToSource({
        label: source.label,
        url: source.url,
        kind: source.kind,
        fetched_at: source.as_of,
      });
      return {
        source: {
          ...mapped,
          id: sourceId(mapped.kind, `${conflict.id}:${index}:${source.url}`),
          date: source.as_of,
          quote: source.claim_en,
        },
        claim: source.claim_en,
      };
    });
    chunks.push(
      chunkOf({
        id: `sop:${playbook.id}:conflict:${conflict.id}`,
        title: conflict.title_en,
        text: [
          `Conflict ${conflict.id}. Resolution is always verify_at_window. Do not pick a winner.`,
          ...sides.map((side, i) => `Claim ${i + 1} (${side.source.title}): ${side.claim}`),
        ].join('\n'),
        kind: 'sop',
        playbookId: playbook.id,
        sources: [sop, ...sides.map((side) => side.source)],
        conflictSides: sides.map((side) => ({
          claim: side.claim,
          sourceId: side.source.id,
        })),
      })
    );
  }

  for (const node of playbook.failure_tree.nodes) {
    chunks.push(
      chunkOf({
        id: `sop:${playbook.id}:fail:${node.id}`,
        title: `${playbook.title_en} — stuck: ${node.question_en}`,
        text: [
          node.advice_en,
          node.never.length ? `never: ${node.never.join(', ')}` : '',
          node.vpn_off_only ? 'vpn_off_only: true' : '',
        ]
          .filter(Boolean)
          .join('\n'),
        kind: 'sop',
        playbookId: playbook.id,
        sources: [sop, ...topUrls],
      })
    );
  }

  return chunks;
}

const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
const MD_HEADING = /^(#{1,3})\s+(.+)$/gm;

function extractMdLinks(text: string): AgentSource[] {
  const sources: AgentSource[] = [];
  for (const match of text.matchAll(MD_LINK)) {
    const title = match[1]?.trim();
    const url = match[2]?.trim();
    if (!title || !url) continue;
    const kind: AgentSourceKind =
      /reddit\.com|xiaohongshu\.com|xhslink\.com/i.test(url)
        ? 'user_report'
        : /gov\.cn|nia\.gov|sz\.gov|szpsq|mtr\.com/i.test(url)
          ? 'official'
          : /reddit|xiaohongshu|community|非法律/i.test(title)
            ? 'user_report'
            : 'docs';
    sources.push({
      id: sourceId(kind, url),
      title,
      kind: kind === 'docs' ? 'user_report' : kind,
      url,
    });
  }
  return sources;
}

function docsFileSource(path: string, title: string): AgentSource {
  return {
    id: sourceId('docs', path),
    title,
    kind: 'docs',
    url: path.replace(/^\//, ''),
  };
}

function chunksFromMarkdown(file: CorpusFile): AgentChunk[] {
  if (typeof file.text !== 'string') return [];
  const titleFromPath =
    file.path.split('/').pop()?.replace(/\.md$/i, '') ?? file.path;
  const fileSource = docsFileSource(file.path, titleFromPath);
  const sections: { title: string; body: string }[] = [];
  const matches = [...file.text.matchAll(MD_HEADING)];
  if (matches.length === 0) {
    sections.push({ title: titleFromPath, body: file.text });
  } else {
    for (let i = 0; i < matches.length; i += 1) {
      const current = matches[i];
      const start = (current.index ?? 0) + current[0].length;
      const end = matches[i + 1]?.index ?? file.text.length;
      sections.push({
        title: current[2]?.trim() || titleFromPath,
        body: file.text.slice(start, end),
      });
    }
  }

  return sections
    .map((section, index) => {
      const links = extractMdLinks(`${section.title}\n${section.body}`);
      if (
        file.text.includes('1t9yeli') ||
        section.body.includes('1t9yeli') ||
        section.body.includes(REDDIT_1T9YELI)
      ) {
        links.unshift({
          id: sourceId('user_report', REDDIT_1T9YELI),
          title: 'r/shenzhen 1t9yeli — scene matrix (非法律来源)',
          kind: 'user_report',
          url: REDDIT_1T9YELI,
        });
      }
      return chunkOf({
        id: `docs:${file.path}:${index}`,
        title: section.title,
        text: section.body,
        kind: 'docs',
        sources: uniqueSources([fileSource, ...links]),
      });
    })
    .filter((chunk) => chunk.text.length > 40);
}

function chunksFromCsv(file: CorpusFile): AgentChunk[] {
  return [
    chunkOf({
      id: `docs:${file.path}`,
      title: file.path.split('/').pop() ?? file.path,
      text: file.text.slice(0, 4000),
      kind: 'docs',
      sources: [docsFileSource(file.path, file.path)],
    }),
  ];
}

export function buildCorpus(
  files: CorpusFile[],
  playbooks: Playbook[] = []
): AgentCorpus {
  const chunks: AgentChunk[] = [];
  for (const playbook of playbooks) {
    chunks.push(
      ...chunksFromPlaybook(playbook, `src/content/sops/${playbook.id}.yaml`)
    );
  }
  for (const file of files) {
    if (typeof file.text !== 'string' || !file.text) continue;
    const path = file.path.replace(/\\/g, '/');
    if (/\/pb-\d{2}[^/]*\.ya?ml$/i.test(path)) {
      const playbook = parsePlaybookYaml(file.text, path);
      chunks.push(...chunksFromPlaybook(playbook, path));
      continue;
    }
    if (path.endsWith('.md')) {
      chunks.push(...chunksFromMarkdown({ ...file, path }));
      continue;
    }
    if (path.endsWith('.csv')) {
      chunks.push(...chunksFromCsv({ ...file, path }));
    }
  }

  const sourcesById = new Map<string, AgentSource>();
  for (const chunk of chunks) {
    for (const source of chunk.sources) {
      if (!sourcesById.has(source.id)) sourcesById.set(source.id, source);
    }
  }

  return { chunks, sourcesById };
}

export function corpusHasRedditThread(corpus: AgentCorpus): boolean {
  return [...corpus.sourcesById.values()].some(
    (source) => source.url === REDDIT_1T9YELI
  );
}
