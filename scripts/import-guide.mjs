#!/usr/bin/env node
// Import Felix's Shenzhen notes (Obsidian vault, digital-garden repo) into
// src/content/guide/<category>/<slug>.md with structured frontmatter.
//
//   node scripts/import-guide.mjs "<path to digital-garden>/🌆 Shenzhen"
//
// Re-run after editing the vault. The output is generated — edit the vault,
// not the files under src/content/guide.
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const SOURCE_REPO =
  'https://github.com/greek-zzf/digital-garden/blob/main/%F0%9F%8C%86%20Shenzhen';
const CATEGORIES = ['food', 'coffee', 'tips'];

/** Listed as "(Permanently Closed)" in the vault's index pages. */
const CLOSED = new Set(['matemade-coffee-bakery', 'gui-phoenix-guizhou-cuisine']);

const srcDir = process.argv[2];
if (!srcDir || !fs.existsSync(srcDir)) {
  console.error('Usage: node scripts/import-guide.mjs "<digital-garden>/🌆 Shenzhen"');
  process.exit(1);
}
const outDir = path.resolve(import.meta.dirname, '../src/content/guide');

const HAS_CJK = /[㐀-鿿]/;

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  return { meta: parseYaml(m[1]) ?? {}, body: m[2] };
}

/** Split on `## ` headings → [{ heading, lines }], preamble has heading ''. */
function sections(body) {
  const out = [{ heading: '', lines: [] }];
  for (const line of body.split('\n')) {
    if (/^##\s/.test(line)) out.push({ heading: line.replace(/^##\s*/, ''), lines: [] });
    else out.at(-1).lines.push(line);
  }
  return out;
}

const plain = (s) =>
  s
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?…)])/g, '$1')
    .trim();

function field(lines, label) {
  const re = new RegExp(`\\*\\*${label}\\*?\\*?:?\\*?\\*?\\s*:?\\s*(.+)$`, 'i');
  for (const line of lines) {
    const m = line.match(re);
    if (m) return plain(m[1].replace(/^:\s*/, ''));
  }
  return undefined;
}

/** Location block has "Address / Chinese / Metro (Station) / Chinese" pairs. */
function parseLocation(lines) {
  const loc = {};
  let last = null;
  for (const line of lines) {
    const m = line.match(/\*\*([^*]+?):?\*\*:?\s*(.+)$/);
    if (!m) continue;
    const label = m[1].toLowerCase();
    const value = plain(m[2]);
    if (label.startsWith('address')) {
      loc.address = value;
      last = 'address';
    } else if (label.startsWith('metro')) {
      // A second "Metro" line written in Chinese is the Chinese metro line.
      if (loc.metro && HAS_CJK.test(value)) loc.metro_zh = value;
      else loc.metro = value;
      last = 'metro';
    } else if (label.startsWith('chinese')) {
      if (last === 'metro') loc.metro_zh = value;
      else loc.address_zh = value;
    } else if (label.startsWith('note')) {
      loc.location_note = m[2].trim();
    }
  }
  return loc;
}

function areaFor({ address = '', metro = '' }) {
  const s = `${address} ${metro}`;
  if (/Shekou|Dongjiaotou|Sihai|Shuiwan|Nanhai Rose Garden/i.test(s)) return 'Shekou';
  if (/Bao'?an/i.test(s)) return "Bao'an";
  if (/Futian/i.test(s)) return 'Futian';
  if (/Luohu/i.test(s)) return 'Luohu';
  if (/Nanshan|Shenzhen Bay/i.test(s)) return 'Nanshan';
  return undefined;
}

function parseRating(lines) {
  const text = lines.join('\n').trim();
  const starLine = lines.find((l) => /⭐|\(\d(\.\d)?\/5\)/.test(l)) ?? '';
  const fraction = starLine.match(/\((\d(?:\.\d)?)\/5\)/);
  const bare = starLine.match(/(\d\.\d|\b\d\b)/);
  const rating = fraction ? Number(fraction[1]) : bare ? Number(bare[1]) : undefined;
  // Anything after the score on the star line, e.g. "- Lowered slightly…".
  const note = plain(
    starLine
      .replace(/^[^\d(]*/, '')
      .replace(/^\d(\.\d)?\s*/, '')
      .replace(/^\(\d(\.\d)?\/5\)\s*/, '')
      .replace(/^[-–—]\s*/, '')
      .replace(/^\((.*)\)\.?$/, '$1')
  );
  const extra = text
    .split('\n')
    .filter((l) => l !== starLine && !/represents half a star/.test(l))
    .join('\n')
    .trim();
  return { rating, rating_note: note || undefined, verdict: extra || undefined };
}

const listItems = (lines) =>
  lines.filter((l) => /^\s*-\s+/.test(l)).map((l) => plain(l.replace(/^\s*-\s+/, ''))).filter(Boolean);

const images = (lines) =>
  lines.flatMap((l) => [...l.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]));

function main() {
  // First pass: every note's slug + title so wiki-links can resolve.
  const notes = [];
  for (const category of CATEGORIES) {
    const dir = path.join(srcDir, category);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
      const { meta, body } = splitFrontmatter(raw);
      const base = file.replace(/\.md$/, '');
      notes.push({ category, file, base, slug: base.toLowerCase(), meta, body });
    }
  }

  const norm = (s) => plain(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '');
  const bySlugOrTitle = new Map();
  for (const n of notes) {
    bySlugOrTitle.set(n.base.toLowerCase(), n.slug);
    bySlugOrTitle.set(norm(n.base), n.slug);
    if (n.meta.title) bySlugOrTitle.set(norm(String(n.meta.title)), n.slug);
  }
  const resolveWiki = (text) =>
    text
      .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\|([^\]]+)\]\]/g, (_, target, label) => {
        const slug = bySlugOrTitle.get(target.toLowerCase()) ?? bySlugOrTitle.get(norm(target));
        return slug ? `[${label}](/guide/${slug})` : label;
      })
      .replace(/\[\[([^\]|#]+)(?:#[^\]]*)?\]\]/g, (_, target) => {
        const slug = bySlugOrTitle.get(target.toLowerCase()) ?? bySlugOrTitle.get(norm(target));
        return slug ? `[${target}](/guide/${slug})` : target;
      })
      .replace(/\s\^[a-z0-9]{6}\s*$/gm, '');

  fs.rmSync(outDir, { recursive: true, force: true });
  let count = 0;

  for (const n of notes) {
    let title = String(n.meta.title ?? n.base.replace(/-/g, ' '));
    let title_zh;
    const zh = title.match(/\s*\(([^)]*[㐀-鿿][^)]*)\)\s*$/);
    if (zh) {
      title_zh = zh[1].trim();
      title = title.slice(0, zh.index).trim();
    }

    const fm = { title, title_zh, category: n.category };
    const bodyParts = [];
    let photos = [];

    for (const sec of sections(resolveWiki(n.body))) {
      const h = sec.heading.toLowerCase();
      if (h.includes('location')) Object.assign(fm, parseLocation(sec.lines));
      else if (h.includes('rating')) {
        const r = parseRating(sec.lines);
        fm.rating = r.rating;
        fm.rating_note = r.rating_note;
        if (r.verdict) bodyParts.push(`## Verdict\n\n${r.verdict}`);
      } else if (h.includes('suitable')) fm.good_for = listItems(sec.lines);
      else if (h.includes('photo')) photos = images(sec.lines);
      else if (h.includes('experience') || h === '') {
        const text = sec.lines.join('\n').trim();
        if (text) bodyParts.unshift(text);
      } else {
        bodyParts.push(`## ${plain(sec.heading)}\n\n${sec.lines.join('\n').trim()}`);
      }
    }

    // Tips: a bare emoji line that titles a table reads better as a heading.
    let body = bodyParts.join('\n\n').replace(/^([^\n#|-][^\n]{0,60})\n\n(\|)/m, '## $1\n\n$2');
    body = body.replace(/\n{3,}/g, '\n\n').trim();

    const firstPara = body.split(/\n\n/).find((p) => !/^(#|\||-|!\[)/.test(p.trim())) ?? '';
    const summary = plain(firstPara.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));

    fm.area = n.category === 'tips' ? undefined : areaFor(fm);
    fm.closed = CLOSED.has(n.slug) || undefined;
    fm.summary = summary.length > 180 ? `${summary.slice(0, 177).replace(/\s+\S*$/, '')}…` : summary;
    fm.photos = photos.length ? photos : undefined;
    fm.source = `${SOURCE_REPO}/${n.category}/${encodeURIComponent(n.file)}`;
    fm.updated = n.meta['date created']
      ? String(n.meta['date created']).slice(0, 10)
      : undefined;

    const clean = Object.fromEntries(Object.entries(fm).filter(([, v]) => v !== undefined && v !== ''));
    const out = `---\n${stringifyYaml(clean, { lineWidth: 0 })}---\n\n${body}\n`;
    const dest = path.join(outDir, n.category, `${n.slug}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, out);
    count++;
  }
  console.log(`Imported ${count} guide entries → ${path.relative(process.cwd(), outDir)}`);
}

main();
