import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCorpus, corpusHasRedditThread } from './build';
import { loadCorpusFilesFromDisk } from './load-disk';
import { retrieveChunks } from './retrieve';
import { REDDIT_1T9YELI } from './types';

const CORPUS = buildCorpus(loadCorpusFilesFromDisk());

describe('agent corpus index', () => {
  it('indexes SOP YAML plus field-research and field-verification docs', () => {
    assert.ok(CORPUS.chunks.length > 30);
    assert.ok(CORPUS.chunks.some((chunk) => chunk.playbookId === 'pb-01'));
    assert.ok(CORPUS.chunks.some((chunk) => chunk.playbookId === 'pb-02'));
    assert.ok(CORPUS.chunks.some((chunk) => chunk.playbookId === 'pb-05'));
    assert.ok(CORPUS.chunks.some((chunk) => chunk.kind === 'docs'));
    assert.ok(CORPUS.chunks.some((chunk) => chunk.kind === 'sop'));
    assert.equal(corpusHasRedditThread(CORPUS), true);
    assert.ok(
      [...CORPUS.sourcesById.values()].some((source) => source.url === REDDIT_1T9YELI)
    );
  });

  it('retrieves payment, 24h lodging, and metro QR notes', () => {
    const payments = retrieveChunks(
      CORPUS,
      'How do I get WeChat Pay or Alipay working on a foreign card?'
    );
    assert.ok(payments.length > 0);
    assert.ok(payments.some((hit) => hit.chunk.playbookId === 'pb-01'));

    const lodging = retrieveChunks(
      CORPUS,
      'I am not in a hotel — how do I do 24-hour accommodation registration?'
    );
    assert.ok(lodging.length > 0);
    assert.ok(lodging.some((hit) => hit.chunk.playbookId === 'pb-02'));

    const metro = retrieveChunks(
      CORPUS,
      'How do I ride the Shenzhen metro with a QR code?'
    );
    assert.ok(metro.length > 0);
    assert.ok(metro.some((hit) => hit.chunk.playbookId === 'pb-05'));
  });

  it('returns no chunks for an off-corpus question', () => {
    const hits = retrieveChunks(
      CORPUS,
      'What is the best dim sum restaurant and nightlife in Lisbon?'
    );
    assert.equal(hits.length, 0);
  });
});
