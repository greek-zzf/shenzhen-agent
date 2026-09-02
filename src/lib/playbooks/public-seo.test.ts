import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PUBLIC_PLAYBOOK_PATHS,
  PUBLIC_PLAYBOOK_SEO,
  PUBLIC_PLAYBOOK_SLUGS,
  buildPublicPlaybookHead,
  publicPlaybookCanonical,
} from './public-seo';

const APP_URL = 'https://example.com';

const INVENTED_HOURS_OR_FEES = [
  '6:30',
  '24:00',
  '17:00',
  '130',
  'RMB',
  'midnight',
  'until 24',
];

describe('public playbook SEO map', () => {
  it('covers the three ranking URLs', () => {
    assert.deepEqual([...PUBLIC_PLAYBOOK_SLUGS], [
      'voa-hours',
      'alipay-metro',
      'accommodation-registration',
    ]);
    assert.deepEqual([...PUBLIC_PLAYBOOK_PATHS], [
      '/p/voa-hours',
      '/p/alipay-metro',
      '/p/accommodation-registration',
    ]);
  });

  it('covers every YAML public_slug', () => {
    const sopDir = join(
      dirname(fileURLToPath(import.meta.url)),
      '../../content/sops'
    );
    const slugs = readdirSync(sopDir)
      .filter((name) => /^pb-\d{2}-.+\.yaml$/.test(name))
      .flatMap((name) => {
        const raw = readFileSync(join(sopDir, name), 'utf8');
        const match = raw.match(/^public_slug:\s*(\S+)\s*$/m);
        const value = match?.[1];
        if (!value || value === 'null') return [];
        return [value];
      });
    assert.ok(slugs.length >= 3, 'expected the three public playbook slugs');
    for (const slug of slugs) {
      assert.ok(
        slug in PUBLIC_PLAYBOOK_SEO,
        `missing SEO for public_slug ${slug}`
      );
    }
  });

  it('targets the queries foreigners already Google', () => {
    const voa = PUBLIC_PLAYBOOK_SEO['voa-hours'];
    assert.match(voa.title, /shenzhen visa on arrival hours/i);
    assert.match(voa.description, /conflict/i);
    assert.match(voa.description, /confirm at the window/i);

    const metro = PUBLIC_PLAYBOOK_SEO['alipay-metro'];
    assert.match(metro.title, /alipay metro/i);
    assert.match(metro.title, /foreigner/i);
    assert.match(metro.description, /WeChat Pay/i);
    assert.match(metro.description, /Shenzhen metro/i);

    const stay = PUBLIC_PLAYBOOK_SEO['accommodation-registration'];
    assert.match(stay.title, /temporary accommodation registration/i);
    assert.match(stay.title, /Shenzhen/i);
  });

  it('does not invent VOA hours or fees in title or description', () => {
    const voa = PUBLIC_PLAYBOOK_SEO['voa-hours'];
    const blob = `${voa.title} ${voa.description}`;
    for (const banned of INVENTED_HOURS_OR_FEES) {
      assert.equal(
        blob.includes(banned),
        false,
        `VOA SEO must not include "${banned}"`
      );
    }
  });

  it('keeps chrome/meta in English', () => {
    const cjk = /[\u3400-\u9fff]/;
    for (const slug of PUBLIC_PLAYBOOK_SLUGS) {
      const seo = PUBLIC_PLAYBOOK_SEO[slug];
      assert.equal(cjk.test(seo.title), false, `${slug} title has CJK`);
      assert.equal(cjk.test(seo.description), false, `${slug} description has CJK`);
    }
  });
});

describe('buildPublicPlaybookHead', () => {
  it('emits title, description, canonical, and Open Graph', () => {
    const head = buildPublicPlaybookHead('voa-hours', APP_URL);
    const title = head.meta.find((tag) => 'title' in tag && tag.title);
    assert.ok(title && 'title' in title);
    assert.equal(
      title.title,
      'Shenzhen visa on arrival hours — Shenzhen Copilot'
    );

    const description = head.meta.find(
      (tag) => 'name' in tag && tag.name === 'description'
    );
    assert.ok(description && 'content' in description);
    assert.match(description.content, /conflict/i);

    const ogTitle = head.meta.find(
      (tag) => 'property' in tag && tag.property === 'og:title'
    );
    assert.ok(ogTitle && 'content' in ogTitle);
    assert.equal(ogTitle.content, title.title);

    const ogUrl = head.meta.find(
      (tag) => 'property' in tag && tag.property === 'og:url'
    );
    assert.ok(ogUrl && 'content' in ogUrl);
    assert.equal(ogUrl.content, 'https://example.com/p/voa-hours');

    const ogType = head.meta.find(
      (tag) => 'property' in tag && tag.property === 'og:type'
    );
    assert.ok(ogType && 'content' in ogType);
    assert.equal(ogType.content, 'website');

    assert.deepEqual(head.links, [
      { rel: 'canonical', href: 'https://example.com/p/voa-hours' },
    ]);
  });

  it('strips a trailing slash on the app URL', () => {
    assert.equal(
      publicPlaybookCanonical('alipay-metro', 'https://example.com/'),
      'https://example.com/p/alipay-metro'
    );
  });
});
