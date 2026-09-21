import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genreMatch, rankGenres, MUSIC_SCORE_KEYS } from '../../src/lib/genreScore.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));

test('an identical user and genre profile reaches the documented 95-point ceiling', () => {
  for (const genre of genres) {
    const match = genreMatch(genre.personalityProfile, genre.personalityProfile);
    assert.equal(match.compatibility, 95, genre.id);
    assert.ok(Math.abs(match.weighted - 1) < 1e-12, genre.id);
  }
  const zero = Object.fromEntries(MUSIC_SCORE_KEYS.map(key => [key, 0]));
  assert.equal(genreMatch(zero, zero).compatibility, 95);
});

test('both components use the same 0–1 scale before weighting', () => {
  const user = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
  const genre = genres.find(item => item.id === 'classical_minimalism');
  const match = genreMatch(user, genre.personalityProfile);
  assert.equal(match.compatibility, 91);
  assert.ok(match.cosine >= 0 && match.cosine <= 1);
  assert.ok(match.euclidean >= 0 && match.euclidean <= 1);
  assert.ok(match.weighted >= 0 && match.weighted <= 1);
});

test('every catalogue matchup returns a bounded integer', () => {
  for (const user of genres) {
    for (const genre of genres) {
      const score = genreMatch(user.personalityProfile, genre.personalityProfile).compatibility;
      assert.ok(Number.isInteger(score) && score >= 15 && score <= 95, `${user.id} / ${genre.id}`);
    }
  }
  assert.equal(MUSIC_SCORE_KEYS.length, 5);
});

test('genre ordering uses unrounded similarity when displayed percentages tie', () => {
  const user = { mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50 };
  const near = { ...user, mellow: 49 };
  const ranked = rankGenres(user, [{ id: 'near', personalityProfile: near }, { id: 'exact', personalityProfile: user }]);
  assert.deepEqual(ranked.map(item => item.genre.id), ['exact', 'near']);
  assert.equal(ranked[0].match.compatibility, ranked[1].match.compatibility);
});
