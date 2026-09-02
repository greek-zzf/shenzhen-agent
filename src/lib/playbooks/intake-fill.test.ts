import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { attachPlaybooks, isNeverPlaybook } from './attach';
import {
  applyIntakeFill,
  parseIntakeFill,
  profileFromModelJson,
} from './intake-fill';
import { EMPTY_PROFILE, type CopilotProfile } from './profile';
import type { AttachRule, Playbook } from './schema';

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

const CATALOG = [
  stubPlaybook('pb-01', 'Get something paid', [
    { when: 'broken_contains', value: 'payments' },
  ]),
  stubPlaybook('pb-03', '5-day visa on arrival', [
    { when: 'location_is', value: 'hk_no_visa' },
  ]),
  stubPlaybook('pb-04', 'Get a working SIM or eSIM', [
    { when: 'broken_contains', value: 'no_cn_phone' },
  ]),
];

describe('intake fill parse', () => {
  it('maps mocked model JSON onto profile fields', () => {
    const fill = parseIntakeFill({
      passport_country: 'US',
      visa_type: 'unknown',
      broken: ['payments'],
      district: 'nanshan',
      arrival_date: '2026-09-03',
      stay_type: 'unknown',
      wechat_pay: 'dead',
      alipay: 'unknown',
      has_cn_phone: 'unknown',
      has_cn_bank: 'no',
      location: 'hk_no_visa',
    });

    const profile = applyIntakeFill(EMPTY_PROFILE, fill);

    assert.equal(profile.passport_country, 'United States');
    assert.equal(profile.visa_type, 'unknown');
    assert.deepEqual(profile.broken, ['payments']);
    assert.equal(profile.district, 'nanshan');
    assert.equal(profile.arrival_at, '2026-09-03T00:00:00.000Z');
    assert.equal(profile.stay_type, 'unknown');
    assert.equal(profile.wechat_pay, 'dead');
    assert.equal(profile.alipay, 'unknown');
    assert.equal(profile.has_cn_phone, 'unknown');
    assert.equal(profile.has_cn_bank, 'no');
    assert.equal(profile.location, 'hk_no_visa');
  });

  it('never guesses visa_type from extra model keys', () => {
    const profile = profileFromModelJson({
      passport_country: 'United Kingdom',
      visa_type: null,
      broken: [],
      district: null,
      arrival_date: null,
      stay_type: null,
      wechat_pay: null,
      alipay: null,
      has_cn_phone: null,
      has_cn_bank: null,
      location: 'hk_no_visa',
      recommended_visa: 'VOA',
      steps: [{ title: 'Go to Luohu at 09:00', fee: '160 RMB' }],
    });

    assert.equal(profile.visa_type, '');
    assert.equal(profile.location, 'hk_no_visa');
    assert.equal('steps' in profile, false);
  });
});

describe('attach never path', () => {
  it('does not attach a VPN playbook when the situation mentions VPN', () => {
    const message =
      'US passport, land tomorrow from HK, WeChat Pay dead, please install a VPN';
    assert.match(message, /VPN/i);

    const profile: CopilotProfile = profileFromModelJson({
      passport_country: 'United States',
      visa_type: 'unknown',
      broken: ['payments'],
      district: null,
      arrival_date: '2026-09-03',
      stay_type: 'unknown',
      wechat_pay: 'dead',
      alipay: 'unknown',
      has_cn_phone: 'unknown',
      has_cn_bank: 'unknown',
      location: 'hk_no_visa',
      playbook: 'vpn-install',
      recommend: 'install a VPN',
    });

    const withForbidden = [
      ...CATALOG,
      stubPlaybook('vpn-install', 'Install a VPN', [
        { when: 'broken_contains', value: 'payments' },
      ]),
    ];

    const attached = attachPlaybooks(profile, withForbidden);
    assert.equal(
      attached.some((pb) => isNeverPlaybook(pb) || /vpn/i.test(pb.id)),
      false
    );
    assert.deepEqual(
      attached.map((pb) => pb.id),
      ['pb-03', 'pb-01']
    );
  });
});
