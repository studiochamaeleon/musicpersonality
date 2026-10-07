import test from 'node:test';
import assert from 'node:assert/strict';
import { getPersonalizedResultSummary } from '../../src/lib/resultNarrative.ts';

const genre = { mellow: 80, unpretentious: 40, sophisticated: 70, intense: 25, contemporary: 55 };
test('Korean sound descriptions choose the correct conjunction particle', () => {
  const listener = { ...genre, mellow: 70, contemporary: 55 };
  assert.match(getPersonalizedResultSummary(listener, { ...genre, unpretentious: 45, sophisticated: 80, intense: 40 }, 'ko'), /현대적 사운드와/);
  assert.match(getPersonalizedResultSummary(genre, genre, 'ko'), /차분함과/);
});

test('the result summary uses actual answers and identifies a meaningful mismatch', () => {
  const listener = { mellow: 75, unpretentious: 45, sophisticated: 70, intense: 80, contemporary: 50 };
  const korean = getPersonalizedResultSummary(listener, genre, 'ko');
  assert.match(korean, /강렬함 80점/);
  assert.match(korean, /강렬함에는 55점 차이/);
  assert.match(korean, /모든 곡이 취향이라는 뜻은 아니에요/);

  const english = getPersonalizedResultSummary(listener, genre, 'en');
  assert.match(english, /55-point gap/);
  const japanese = getPersonalizedResultSummary(listener, genre, 'ja');
  assert.match(japanese, /55点の差/);
});

test('an even answer profile is not described as having a standout trait', () => {
  const listener = { mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50 };
  assert.match(getPersonalizedResultSummary(listener, genre, 'ko'), /비슷한 높이/);
  assert.match(getPersonalizedResultSummary(listener, genre, 'en'), /fairly even/);
  assert.match(getPersonalizedResultSummary(listener, genre, 'ja'), /同じくらい/);
});
