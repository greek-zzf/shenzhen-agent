import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  attachPlaybooks,
  isAccommodationSituation,
  primaryAttachedId,
} from './attach';
import { parsePlaybookYaml } from './parse';
import { EMPTY_PROFILE, type CopilotProfile } from './profile';
import {
  MAX_FOCUSED_CLICK_PATH_SCREENS,
  focusedClickPath,
  nextStepId,
  resolveActiveStepId,
  stepProgress,
  visiblePlaybookSteps,
} from './run-focus';
import type { AttachRule, Playbook, PlaybookStep } from './schema';

function loadYaml(name: string): Playbook {
  const path = fileURLToPath(
    new URL(`../../content/sops/${name}`, import.meta.url)
  );
  return parsePlaybookYaml(readFileSync(path, 'utf8'), path);
}

function stubPlaybook(
  id: string,
  title_en: string,
  attach_when: AttachRule[]
): Playbook {
  return {
    id,
    title_en,
    attach_when,
  } as Playbook;
}

const PB02 = loadYaml('pb-02-accommodation.yaml');
const CATALOG = [
  stubPlaybook('pb-01', 'Get something paid', [
    { when: 'broken_contains', value: 'payments' },
  ]),
  stubPlaybook('pb-03', '5-day visa on arrival', [
    { when: 'location_is', value: 'hk_no_visa' },
  ]),
  stubPlaybook('pb-02', '24-hour accommodation registration', [
    { when: 'stay_is', value: 'not_hotel' },
    { when: 'broken_contains', value: 'need_24h' },
  ]),
  stubPlaybook('pb-04', 'Get a working SIM or eSIM', [
    { when: 'broken_contains', value: 'no_cn_phone' },
  ]),
];

describe('run step focus', () => {
  it('defaults to the first visible step and labels Step 1 of N', () => {
    const steps = visiblePlaybookSteps(PB02, EMPTY_PROFILE, 'run');
    const activeId = resolveActiveStepId(steps, undefined, PB02.id);
    const progress = stepProgress(steps, activeId);

    assert.equal(activeId, 'twenty-four-hours');
    assert.equal(progress.index, 0);
    assert.ok(progress.total >= 8);
    assert.equal(progress.label, `Step 1 of ${progress.total}`);
  });

  it('skips hotel-only steps and still focuses one current step', () => {
    const hotel: CopilotProfile = { ...EMPTY_PROFILE, stay_type: 'hotel' };
    const steps = visiblePlaybookSteps(PB02, hotel, 'run');
    const ids = steps.map((step) => step.id);

    assert.equal(ids.includes('email-nudge'), false);
    assert.equal(ids.includes('wechat-click-path'), false);
    assert.equal(ids.includes('twenty-four-hours'), true);

    const activeId = resolveActiveStepId(steps, 'wechat-click-path', PB02.id);
    assert.equal(activeId, 'twenty-four-hours');
    assert.equal(stepProgress(steps, activeId).label, `Step 1 of ${steps.length}`);
  });

  it('Next advances the current step and stops on the last', () => {
    const steps = visiblePlaybookSteps(PB02, EMPTY_PROFILE, 'run');
    const first = steps[0].id;
    const second = nextStepId(steps, first);
    const last = steps[steps.length - 1].id;

    assert.equal(second, steps[1].id);
    assert.equal(nextStepId(steps, last), null);
    assert.equal(
      stepProgress(steps, second ?? first).label,
      `Step 2 of ${steps.length}`
    );
  });

  it('keeps ClickPath to 1–3 screens on the focused step', () => {
    const wechat = PB02.steps.find((step) => step.id === 'wechat-click-path');
    assert.ok(wechat?.click_path);
    assert.ok(wechat.click_path.steps.length > MAX_FOCUSED_CLICK_PATH_SCREENS);

    const focused = focusedClickPath(wechat.click_path);
    assert.ok(focused);
    assert.equal(focused.steps.length, MAX_FOCUSED_CLICK_PATH_SCREENS);
    assert.deepEqual(
      focused.steps.map((item) => item.n),
      [1, 2, 3]
    );
    assert.equal(focusedClickPath(null), null);
  });

  it('does not invent last_verified or hours on pb-02', () => {
    assert.equal(PB02.last_verified, null);
    assert.equal(PB02.status, 'draft');
    const titles = PB02.steps.map((step: PlaybookStep) => step.title_en).join(' ');
    assert.equal(/09:00|160 RMB|last_verified: 2026/.test(titles), false);
  });
});

describe('intake recommends one accommodation path', () => {
  it('treats 24h register or apartment stay as an accommodation situation', () => {
    assert.equal(
      isAccommodationSituation({ ...EMPTY_PROFILE, broken: ['need_24h'] }),
      true
    );
    assert.equal(
      isAccommodationSituation({ ...EMPTY_PROFILE, stay_type: 'apartment' }),
      true
    );
    assert.equal(
      isAccommodationSituation({
        ...EMPTY_PROFILE,
        broken: ['payments'],
        location: 'hk_no_visa',
      }),
      false
    );
  });

  it('prefers pb-02 over an equal menu when registration is the diagnosis', () => {
    const profile: CopilotProfile = {
      ...EMPTY_PROFILE,
      passport_country: 'United States',
      visa_type: 'work',
      stay_type: 'apartment',
      broken: ['need_24h', 'payments', 'no_cn_phone'],
      location: 'already_in_shenzhen',
    };
    const attached = attachPlaybooks(profile, CATALOG);
    assert.ok(attached.some((pb) => pb.id === 'pb-01'));
    assert.ok(attached.some((pb) => pb.id === 'pb-02'));
    assert.ok(attached.some((pb) => pb.id === 'pb-04'));
    assert.equal(primaryAttachedId(attached, profile), 'pb-02');
  });

  it('keeps VOA / payments first when registration is not the diagnosis', () => {
    const voa: CopilotProfile = {
      ...EMPTY_PROFILE,
      location: 'hk_no_visa',
      broken: ['payments'],
    };
    const attached = attachPlaybooks(voa, CATALOG);
    assert.deepEqual(
      attached.map((pb) => pb.id),
      ['pb-03', 'pb-01']
    );
    assert.equal(primaryAttachedId(attached, voa), 'pb-03');
    assert.equal(primaryAttachedId(attached), 'pb-03');
  });
});
