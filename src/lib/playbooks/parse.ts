import { parse as parseYaml } from 'yaml';

import {
  authoredFailureMapSchema,
  playbookSchema,
  type Playbook,
} from './schema';

function isLegacyFailureTree(value: unknown): boolean {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Array.isArray((value as { nodes?: unknown }).nodes)
  );
}

/**
 * Expansion playbooks author failure_tree as a node_id → {prompt_en, options}
 * map. Runtime still uses { id, title_en, nodes }. Legacy v1 files keep `nodes`.
 */
export function normalizeFailureTree(data: unknown): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  const obj = data as Record<string, unknown>;
  const tree = obj.failure_tree;
  if (tree == null || isLegacyFailureTree(tree)) return data;

  const parsed = authoredFailureMapSchema.safeParse(tree);
  if (!parsed.success) {
    const looksLikeMap = Object.values(tree as Record<string, unknown>).some(
      (node) =>
        Boolean(
          node &&
            typeof node === 'object' &&
            !Array.isArray(node) &&
            'prompt_en' in node
        )
    );
    if (!looksLikeMap) return data;
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`failure_tree map failed: ${details}`);
  }

  const playbookId =
    typeof obj.id === 'string' && obj.id.length > 0 ? obj.id : 'pb';
  const nodes = Object.entries(parsed.data).map(([id, node]) => {
    const first = node.options[0];
    const never = [
      ...new Set(node.options.flatMap((option) => option.never ?? [])),
    ];
    return {
      id,
      question_en: node.prompt_en,
      advice_en:
        first?.advice_en ??
        node.options.map((option) => option.label_en).join(' / '),
      never,
      next: first?.next ?? null,
      vpn_off_only: first?.vpn_off_only ?? false,
      options: node.options,
    };
  });

  return {
    ...obj,
    failure_tree: {
      id: `${playbookId}-stuck`,
      title_en: "I'm stuck",
      nodes,
    },
  };
}

export function parsePlaybookYaml(raw: string, source = 'yaml'): Playbook {
  let data: unknown;
  try {
    data = parseYaml(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid YAML in ${source}: ${message}`);
  }

  const result = playbookSchema.safeParse(normalizeFailureTree(data));
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Playbook schema failed in ${source}: ${details}`);
  }

  return result.data;
}
