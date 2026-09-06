import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { parsePlaybookYaml } from './parse';
import type { Playbook } from './schema';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOP_DIR = join(ROOT, 'src/content/sops');
const STOCK_DIR = join(ROOT, 'public/copilot-stock');

const STOCK_CAPTION = 'Stock photo — confirm at the window';

const STOCK_FILES = [
  'pb03-voa-fee-board-sez-130.jpg',
  'pb03-voa-fee-board-reciprocal-table.jpg',
  'pb02-house-qr-doorframe.jpg',
  'pb02-house-code-search-ui.jpg',
  'pb02-house-code-lookup-ui.jpg',
  'pb05-tap-to-ride-floor-gate.jpg',
  'pb05-tap-to-ride-card-reader.jpg',
  'pb05-business-coach-tap-reader.jpg',
] as const;

function loadYaml(name: string): Playbook {
  const path = join(SOP_DIR, name);
  return parsePlaybookYaml(readFileSync(path, 'utf8'), path);
}

function screenshotsOf(playbook: Playbook, stepId: string) {
  const step = playbook.steps.find((item) => item.id === stepId);
  assert.ok(step, `missing step ${stepId}`);
  return step;
}

describe('copilot stock photos', () => {
  it('keeps every playbook draft with last_verified null', () => {
    const files = readdirSync(SOP_DIR).filter((name) =>
      /^pb-\d{2}-.+\.yaml$/.test(name)
    );
    assert.ok(files.length >= 6);
    for (const name of files) {
      const playbook = loadYaml(name);
      assert.equal(playbook.status, 'draft', playbook.id);
      assert.equal(playbook.last_verified, null, playbook.id);
    }
  });

  it('ships the eight public stock files plus attribution', () => {
    for (const name of STOCK_FILES) {
      assert.equal(existsSync(join(STOCK_DIR, name)), true, name);
    }
    const attribution = readFileSync(join(STOCK_DIR, 'ATTRIBUTION.md'), 'utf8');
    assert.match(attribution, /not set `last_verified`/i);
    assert.match(attribution, /NOT cleared/i);
    assert.match(attribution, /2024-12-31/);
    assert.match(attribution, /1as71uf/);
  });

  it('wires pb-03 fee frames without inventing a hours-door photo', () => {
    const pb = loadYaml('pb-03-voa.yaml');
    const fee = screenshotsOf(pb, 'fee-user-report');
    assert.ok(fee.click_path);
    assert.equal(
      fee.click_path?.steps[0]?.screenshot,
      '/copilot-stock/pb03-voa-fee-board-sez-130.jpg'
    );
    assert.equal(
      fee.click_path?.steps[1]?.screenshot,
      '/copilot-stock/pb03-voa-fee-board-reciprocal-table.jpg'
    );
    for (const step of fee.click_path?.steps ?? []) {
      assert.match(step.note ?? '', new RegExp(STOCK_CAPTION));
      assert.match(step.note ?? '', /not founder-verified/i);
      assert.match(step.note ?? '', /expired/i);
    }
    assert.match(fee.why, /community\/news stock/i);

    const hours = screenshotsOf(pb, 'hours-conflict');
    assert.equal(hours.click_path, null);

    const nia = screenshotsOf(pb, 'nia-list');
    for (const step of nia.click_path?.steps ?? []) {
      assert.equal(step.screenshot, null);
    }
  });

  it('wires pb-02 house-code stock on the scan and WeChat steps', () => {
    const pb = loadYaml('pb-02-accommodation.yaml');
    const scan = screenshotsOf(pb, 'scan-house-code');
    assert.equal(
      scan.click_path?.steps[0]?.screenshot,
      '/copilot-stock/pb02-house-qr-doorframe.jpg'
    );
    assert.match(scan.click_path?.steps[0]?.note ?? '', new RegExp(STOCK_CAPTION));
    assert.equal(scan.click_path?.steps[1]?.screenshot, null);

    const wechat = screenshotsOf(pb, 'wechat-click-path');
    assert.equal(
      wechat.click_path?.steps[0]?.screenshot,
      '/copilot-stock/pb02-house-code-search-ui.jpg'
    );
    assert.equal(
      wechat.click_path?.steps[1]?.screenshot,
      '/copilot-stock/pb02-house-code-lookup-ui.jpg'
    );
    assert.equal(wechat.click_path?.steps[2]?.screenshot, null);
  });

  it('keeps Alipay Transport empty and labels Tap-to-Ride as gate backup', () => {
    const pb = loadYaml('pb-05-metro.yaml');
    const transport = screenshotsOf(pb, 'alipay-transport');
    for (const step of transport.click_path?.steps ?? []) {
      assert.equal(step.screenshot, null);
    }

    const skip = screenshotsOf(pb, 'skip-miniprogram');
    for (const step of skip.click_path?.steps ?? []) {
      assert.equal(step.screenshot, null);
    }

    const cash = screenshotsOf(pb, 'cash-token');
    assert.equal(cash.click_path?.steps[0]?.screenshot, null);
    assert.equal(cash.click_path?.steps[1]?.screenshot, null);
    assert.equal(
      cash.click_path?.steps[2]?.screenshot,
      '/copilot-stock/pb05-tap-to-ride-floor-gate.jpg'
    );
    assert.equal(
      cash.click_path?.steps[3]?.screenshot,
      '/copilot-stock/pb05-tap-to-ride-card-reader.jpg'
    );
    assert.equal(
      cash.click_path?.steps[4]?.screenshot,
      '/copilot-stock/pb05-business-coach-tap-reader.jpg'
    );
    assert.match(cash.click_path?.steps[4]?.text_en ?? '', /secondary/i);
    assert.match(cash.click_path?.steps[4]?.text_en ?? '', /not an ordinary/i);
    for (const step of cash.click_path?.steps.slice(2) ?? []) {
      assert.match(step.note ?? '', new RegExp(STOCK_CAPTION));
    }

    const trial = screenshotsOf(pb, 'tap-to-ride-trial');
    assert.equal(trial.slot, 'conflict');
    assert.equal(
      trial.click_path?.steps[0]?.screenshot,
      '/copilot-stock/pb05-tap-to-ride-floor-gate.jpg'
    );
    assert.equal(
      trial.click_path?.steps[1]?.screenshot,
      '/copilot-stock/pb05-tap-to-ride-card-reader.jpg'
    );
    assert.equal(
      trial.click_path?.steps[2]?.screenshot,
      '/copilot-stock/pb05-business-coach-tap-reader.jpg'
    );
    assert.match(trial.click_path?.steps[2]?.text_en ?? '', /secondary/i);
  });
});
