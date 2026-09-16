import { AGENT_MAX_MESSAGE_CHARS } from './types';

export function sanitizeAgentMessage(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, AGENT_MAX_MESSAGE_CHARS);
}

export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
