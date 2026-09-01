import { parse as parseYaml } from 'yaml';

import { playbookSchema, type Playbook } from './schema';

export function parsePlaybookYaml(raw: string, source = 'yaml'): Playbook {
  let data: unknown;
  try {
    data = parseYaml(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid YAML in ${source}: ${message}`);
  }

  const result = playbookSchema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Playbook schema failed in ${source}: ${details}`);
  }

  return result.data;
}
