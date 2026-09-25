import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { GENRE_SOUNDS, getGenreSound, getResultIdentityCopy } from '../../src/lib/resultIdentity.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));

test('all 32 result genres have a complete, short sound description in three languages', () => {
  assert.equal(genres.length, 32);
  assert.deepEqual(Object.keys(GENRE_SOUNDS).sort(), genres.map(genre => genre.id).sort());
  for (const genre of genres) {
    for (const language of ['ko', 'en', 'ja']) {
      const sound = getGenreSound(genre.id, language);
      assert.equal(typeof sound, 'string');
      assert.ok(sound.length > 10 && sound.length < 90, `${genre.id}: ${language}`);
    }
    assert.match(getGenreSound(genre.id, 'ko'), /음악$/);
    assert.match(getGenreSound(genre.id, 'ja'), /音楽$/);
  }
});

test('result sentence fragments have natural language-specific endings', () => {
  assert.equal(getResultIdentityCopy('ko').affinity, '을 사랑하는');
  assert.equal(getResultIdentityCopy('ja').affinity, 'を愛する');
  assert.equal(getResultIdentityCopy('ja').quoteOpen, '「');
  assert.equal(getResultIdentityCopy('ja').quoteClose, '」');
  assert.equal(getResultIdentityCopy('en').affinity, 'Drawn to');
});
