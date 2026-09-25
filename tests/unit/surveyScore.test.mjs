import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateMUSICScores, isValidAnswer } from '../../src/lib/surveyScore.ts';

const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));

test('neutral answers yield 50 on each dimension, including reverse-scored questions', () => {
  const answers = Object.fromEntries(questions.map(question => [question.id, 3]));
  assert.deepEqual(calculateMUSICScores(questions, answers), {
    mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50,
  });
});

test('weight sums, reverse scoring, and seven-point scales are applied correctly', () => {
  const sample = [
    { id: 'a', category: 'mellow', scale: 5, weight: 1, reverse: false },
    { id: 'b', category: 'mellow', scale: 5, weight: 3, reverse: false },
    { id: 'c', category: 'mellow', scale: 5, weight: 1, reverse: true },
    { id: 'd', category: 'intense', scale: 7, weight: 1, reverse: false },
  ];
  const scores = calculateMUSICScores(sample, { a: 1, b: 5, c: 1, d: 4 });
  assert.equal(scores.mellow, 80);
  assert.equal(scores.intense, 50);
});

test('malformed answers cannot contribute to a result', () => {
  const question = { id: 'q', category: 'mellow', scale: 5, weight: 1 };
  for (const invalid of [0, 6, 2.5, '3', null, Number.NaN, Infinity]) {
    assert.equal(isValidAnswer(question, invalid), false);
    assert.equal(calculateMUSICScores([question], { q: invalid }).mellow, 0);
  }
  assert.equal(isValidAnswer(question, 3), true);
});
