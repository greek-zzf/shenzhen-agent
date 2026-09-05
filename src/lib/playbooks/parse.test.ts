import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { parsePlaybookYaml } from './parse';

function load(name: string) {
  const path = fileURLToPath(
    new URL(`../../content/sops/${name}`, import.meta.url)
  );
  return parsePlaybookYaml(readFileSync(path, 'utf8'), path);
}

describe('failure_tree authored map', () => {
  it('keeps legacy nodes arrays on v1 playbooks', () => {
    const pb = load('pb-01-payments.yaml');
    assert.ok(pb.failure_tree.nodes.length >= 1);
    assert.equal(pb.failure_tree.nodes[0]?.id, 'wechat-dead');
    assert.ok(pb.failure_tree.nodes[0]?.question_en);
  });

  it('normalizes PB-06..09 maps of prompt_en + options', () => {
    const bank = load('pb-06-bank.yaml');
    assert.equal(bank.failure_tree.id, 'pb-06-stuck');
    const visa = bank.failure_tree.nodes.find((n) => n.id === 'visa-refused');
    assert.ok(visa);
    assert.match(visa.question_en, /tourist, or VOA/i);
    assert.ok((visa.options?.length ?? 0) >= 2);
    assert.ok(visa.never.includes('proxy_account'));

    const housing = load('pb-07-housing.yaml');
    assert.ok(housing.failure_tree.nodes.some((n) => n.id === 'asked-fake-juzhu'));

    const hospital = load('pb-08-hospital.yaml');
    assert.ok(hospital.failure_tree.nodes.some((n) => n.id === 'asked-for-diagnosis'));

    const work = load('pb-09-work-permit.yaml');
    assert.ok(work.failure_tree.nodes.some((n) => n.id === 'asked-guakao'));
    assert.ok(
      work.failure_tree.nodes
        .flatMap((n) => n.never)
        .includes('visa_run')
    );
  });

  it('rejects a nodes array disguised as the only shape for expansion files', () => {
    const raw = readFileSync(
      fileURLToPath(new URL('../../content/sops/pb-06-bank.yaml', import.meta.url)),
      'utf8'
    );
    assert.equal(/\n  nodes:\n/.test(raw), false);
    assert.match(raw, /prompt_en:/);
    assert.match(raw, /\n  visa-refused:\n/);
  });
});
