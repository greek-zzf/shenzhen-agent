import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { parsePlaybookYaml } from './parse';

describe('pb-02 email nudge step', () => {
  it('validates and stays skippable for hotel stays', () => {
    const path = fileURLToPath(
      new URL('../../content/sops/pb-02-accommodation.yaml', import.meta.url)
    );
    const playbook = parsePlaybookYaml(readFileSync(path, 'utf8'), path);
    const step = playbook.steps.find((item) => item.id === 'email-nudge');
    assert.ok(step);
    assert.equal(step?.skippable, true);
    assert.deepEqual(step?.skip_if, { field: 'stay_type', equals: 'hotel' });
  });
});
