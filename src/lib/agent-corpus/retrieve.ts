import { expandQueryTokens, tokenize } from './tokenize';
import type { AgentChunk, AgentCorpus } from './types';
import { AGENT_RETRIEVE_TOP_K } from './types';

const K1 = 1.2;
const B = 0.75;

export type RetrievedChunk = {
  chunk: AgentChunk;
  score: number;
};

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

function idfMap(chunks: AgentChunk[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const chunk of chunks) {
    const unique = new Set(chunk.tokens);
    for (const token of unique) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  const n = chunks.length || 1;
  const idf = new Map<string, number>();
  for (const [token, count] of df) {
    idf.set(token, Math.log(1 + (n - count + 0.5) / (count + 0.5)));
  }
  return idf;
}

let cachedIdf: { chunks: AgentChunk[]; idf: Map<string, number>; avgdl: number } | null =
  null;

function stats(chunks: AgentChunk[]) {
  if (cachedIdf?.chunks === chunks) return cachedIdf;
  const avgdl =
    chunks.reduce((sum, chunk) => sum + chunk.tokens.length, 0) /
      (chunks.length || 1) || 1;
  cachedIdf = { chunks, idf: idfMap(chunks), avgdl };
  return cachedIdf;
}

export function retrieveChunks(
  corpus: AgentCorpus,
  query: string,
  topK = AGENT_RETRIEVE_TOP_K
): RetrievedChunk[] {
  const queryTokens = expandQueryTokens(tokenize(query));
  if (queryTokens.length === 0 || corpus.chunks.length === 0) return [];

  const { idf, avgdl } = stats(corpus.chunks);
  const scored: RetrievedChunk[] = [];

  for (const chunk of corpus.chunks) {
    const tf = termFreq(chunk.tokens);
    let score = 0;
    let hits = 0;
    for (const token of queryTokens) {
      const freq = tf.get(token) ?? 0;
      if (!freq) continue;
      hits += 1;
      const w = idf.get(token) ?? 0;
      const dl = chunk.tokens.length || 1;
      score +=
        (w * (freq * (K1 + 1))) / (freq + K1 * (1 - B + B * (dl / avgdl)));
    }
    const title = chunk.title.toLowerCase();
    for (const token of queryTokens) {
      if (title.includes(token)) score += 1.4;
    }
    if (hits === 0 || score <= 0) continue;
    const coverage = hits / queryTokens.length;
    // One generic token ("restaurant") is not enough; a single specific
    // token ("voa", "乘车码") still counts when coverage is high.
    if (hits < 2 && coverage < 0.45) continue;
    scored.push({ chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  const best = top[0]?.score ?? 0;
  // Drop weak tails so off-topic questions do not pick up noise.
  return top.filter((item) => item.score >= best * 0.18 && item.score >= 0.35);
}

export function flattenRetrievedText(hits: RetrievedChunk[]): string {
  return hits
    .map((hit) => `${hit.chunk.title}\n${hit.chunk.text}`)
    .join('\n')
    .toLowerCase();
}
