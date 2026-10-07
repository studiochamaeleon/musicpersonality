import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genreMatch, rankGenres, MUSIC_SCORE_KEYS } from '../../src/lib/genreScore.ts';
import { rankResultGenres } from '../../src/lib/resultRanking.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));

test('an identical user and genre profile reaches 100% profile similarity', () => {
  for (const genre of genres) {
    const match = genreMatch(genre.personalityProfile, genre.personalityProfile);
    assert.equal(match.compatibility, 100, genre.id);
    assert.equal(match.distance, 0, genre.id);
  }
  const zero = Object.fromEntries(MUSIC_SCORE_KEYS.map(key => [key, 0]));
  assert.equal(genreMatch(zero, zero).compatibility, 100);
});

test('display score is based on the actual five-axis distance', () => {
  const user = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
  const genre = genres.find(item => item.id === 'classical_minimalism');
  const match = genreMatch(user, genre.personalityProfile);
  const expectedDistance = Math.sqrt(Object.keys(user).reduce(
    (sum, key) => sum + (user[key] - genre.personalityProfile[key]) ** 2, 0,
  ) / MUSIC_SCORE_KEYS.length);
  assert.ok(Math.abs(match.distance - expectedDistance) < 1e-12);
  assert.equal(match.compatibility, Math.round(100 - expectedDistance));
  assert.ok(match.cosine >= 0 && match.cosine <= 1);
  assert.ok(match.euclidean >= 0 && match.euclidean <= 1);
  assert.ok(match.similarity >= 0 && match.similarity <= 1);
});

test('every catalogue matchup returns a bounded integer', () => {
  for (const user of genres) {
    for (const genre of genres) {
      const score = genreMatch(user.personalityProfile, genre.personalityProfile).compatibility;
      assert.ok(Number.isInteger(score) && score >= 0 && score <= 100, `${user.id} / ${genre.id}`);
    }
  }
  assert.equal(MUSIC_SCORE_KEYS.length, 5);
});

test('one large trait mismatch scores lower than five small gaps', () => {
  const user = { mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50 };
  const oneLargeGap = { ...user, mellow: 10 };
  const fiveSmallGaps = { mellow: 35, unpretentious: 35, sophisticated: 35, intense: 35, contemporary: 35 };
  assert.ok(genreMatch(user, oneLargeGap).compatibility < genreMatch(user, fiveSmallGaps).compatibility);
});

test('genre ordering uses unrounded similarity when displayed percentages tie', () => {
  const user = { mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50 };
  const near = { ...user, mellow: 49 };
  const ranked = rankGenres(user, [{ id: 'near', personalityProfile: near }, { id: 'exact', personalityProfile: user }]);
  assert.deepEqual(ranked.map(item => item.genre.id), ['exact', 'near']);
  assert.equal(ranked[0].match.compatibility, ranked[1].match.compatibility);
});

test('new sound profiles are not duplicates of an existing result type', () => {
  for (const id of ['hiphop_jazzhop', 'electronic_melodic_dance']) {
    const candidate = genres.find(genre => genre.id === id);
    const nearest = genres.filter(genre => genre.id !== id).map(genre => ({ id: genre.id, distance: genreMatch(candidate.personalityProfile, genre.personalityProfile).distance })).sort((a, b) => a.distance - b.distance)[0];
    assert.ok(nearest.distance >= 10, `${id} is too close to ${nearest.id}: ${nearest.distance}`);
  }
});

test('a version 2 share keeps its original ranking while version 3 uses the updated catalogue', () => {
  const user = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
  const legacy = rankResultGenres(user, genres, 2);
  const current = rankResultGenres(user, genres, 3);
  assert.equal(legacy.length, 32);
  assert.equal(current.length, 34);
  assert.equal(legacy[0].genre.id, 'pop_indie');
  assert.equal(legacy[0].match.compatibility, 91);
  assert.equal(current[0].genre.id, 'hiphop_jazzhop');
  assert.equal(current[0].match.compatibility, 92);
});
