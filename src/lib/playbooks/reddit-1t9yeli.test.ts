import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parsePlaybookYaml } from './parse';
import type { Playbook } from './schema';

const THREAD =
  'https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/';

function loadYaml(name: string): Playbook {
  const path = fileURLToPath(
    new URL(`../../content/sops/${name}`, import.meta.url)
  );
  return parsePlaybookYaml(readFileSync(path, 'utf8'), path);
}

function citesThread(playbook: Playbook): boolean {
  if (playbook.official_urls.some((item) => item.url === THREAD)) return true;
  return playbook.conflicts.some((conflict) =>
    conflict.sources.some((source) => source.url === THREAD)
  );
}

function node(playbook: Playbook, id: string) {
  const found = playbook.failure_tree.nodes.find((item) => item.id === id);
  assert.ok(found, `missing failure node ${id} on ${playbook.id}`);
  return found;
}

function conflict(playbook: Playbook, id: string) {
  const found = playbook.conflicts.find((item) => item.id === id);
  assert.ok(found, `missing conflict ${id} on ${playbook.id}`);
  return found;
}

describe('r/shenzhen 1t9yeli field tips (unverified)', () => {
  const pb01 = loadYaml('pb-01-payments.yaml');
  const pb05 = loadYaml('pb-05-metro.yaml');
  const pb08 = loadYaml('pb-08-hospital.yaml');

  it('keeps drafts unverified and cites the thread as user_report', () => {
    for (const playbook of [pb01, pb05, pb08]) {
      assert.equal(playbook.status, 'draft', playbook.id);
      assert.equal(playbook.last_verified, null, playbook.id);
      assert.equal(citesThread(playbook), true, playbook.id);
    }
    const report = pb01.official_urls.find((item) => item.url === THREAD);
    assert.equal(report?.kind, 'user_report');
  });

  it('pb-01 keeps Tour Card wind-down side-by-side and does not pick a wallet winner', () => {
    const tour = conflict(pb01, 'tourcard-vs-direct');
    assert.equal(tour.resolution, 'verify_at_window');
    const claims = tour.sources.map((source) => source.claim_en).join(' ');
    assert.match(claims, /Tour Pass/i);
    assert.match(claims, /gone for years|direct/i);
    assert.match(claims, /do not pick a winner/i);

    const wallets = conflict(pb01, 'alipay-vs-wechat');
    const walletClaims = wallets.sources.map((source) => source.claim_en).join(' ');
    assert.match(walletClaims, /Alipay is the easier/i);
    assert.match(walletClaims, /WeChat was easy/i);
    assert.match(walletClaims, /Install both/i);

    const spend = conflict(pb01, 'wechat-annual-limit');
    assert.equal(spend.sources.length >= 2, true);
    assert.match(
      spend.sources.map((source) => source.claim_en).join(' '),
      /do not invent a (number|figure)/i
    );
  });

  it('pb-01 ships executable stuck nodes, not a park playbook', () => {
    assert.ok(node(pb01, 'wechat-dead'));
    assert.ok(node(pb01, 'alipay-dead'));
    assert.ok(node(pb01, 'wechat-spend-limit'));
    assert.ok(node(pb01, 'dual-wallet-midtrip'));
    assert.ok(node(pb01, 'cash-parachute'));
    assert.ok(node(pb01, 'scene-taxi'));
    assert.ok(node(pb01, 'scene-hospital'));
    assert.ok(node(pb01, 'scene-park-cash'));
    assert.match(node(pb01, 'scene-park-cash').advice_en, /one-line/i);
    assert.match(node(pb01, 'vpn-off').advice_en, /risk note only/i);
    assert.match(node(pb01, 'vpn-off').advice_en, /do not teach/i);
    assert.equal(
      /how to (install|set up|download) a vpn/i.test(node(pb01, 'vpn-off').advice_en),
      false
    );

    const sopDir = join(dirname(fileURLToPath(import.meta.url)), '../../content/sops');
    const names = readdirSync(sopDir).filter((name) => /^pb-\d{2}-.+\.yaml$/.test(name));
    assert.equal(
      names.some((name) => /park|restaurant|attraction/.test(name)),
      false
    );
  });

  it('pb-05 keeps tap-to-ride as a gate conflict and records the Octopus T-Union split', () => {
    const octopus = conflict(pb05, 'octopus-note');
    const octopusClaims = octopus.sources.map((source) => source.claim_en).join(' ');
    assert.match(octopusClaims, /T-Union/i);
    assert.match(octopusClaims, /regular Hong Kong Octopus/i);
    assert.match(octopusClaims, /does not take Octopus or Visa/i);
    assert.equal(octopus.resolution, 'verify_at_window');

    const card = conflict(pb05, 'c-qr-vs-foreign-card');
    assert.match(
      card.sources.map((source) => source.claim_en).join(' '),
      /some machines|gates mostly no/i
    );

    const trial = conflict(pb05, 'c-tap-to-ride-trial');
    assert.equal(trial.resolution, 'verify_at_window');
    assert.match(
      trial.sources.map((source) => source.claim_en).join(' '),
      /gates mostly no|confirm at the gate/i
    );

    assert.ok(node(pb05, 'cash-machine'));
    assert.ok(node(pb05, 'foreign-card-inconsistent'));
    assert.ok(node(pb05, 'octopus-unverified'));
    assert.match(node(pb05, 'vpn-off').advice_en, /do not teach VPN/i);
  });

  it('pb-08 routes the kiosk Chinese-ID trap to the human counter + cash', () => {
    const kiosk = conflict(pb08, 'c-kiosk-chinese-id');
    assert.equal(kiosk.resolution, 'verify_at_window');
    assert.match(
      kiosk.sources.map((source) => source.claim_en).join(' '),
      /Chinese ID/i
    );
    assert.match(node(pb08, 'kiosk_chinese_id').advice_en, /human counter/i);
    const step = pb08.steps.find((item) => item.id === 'kiosk-id-trap');
    assert.ok(step);
    assert.match(step?.speech_card?.en ?? '', /cash/i);
    assert.equal(step?.stuck_node, 'kiosk_chinese_id');
  });

  it('does not invent a park/restaurant playbook file', () => {
    const sopDir = join(dirname(fileURLToPath(import.meta.url)), '../../content/sops');
    assert.equal(existsSync(join(sopDir, 'pb-park.yaml')), false);
    assert.equal(existsSync(join(sopDir, 'pb-11-park.yaml')), false);
  });
});
