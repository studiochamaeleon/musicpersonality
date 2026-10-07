import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackCopy, formatResultFeedback } from '../../src/lib/resultFeedback.ts';

test('feedback separates genre, character and track ratings in all three languages', () => {
  for (const language of ['ko', 'en', 'ja']) {
    const context = { kind: 'personal', genres: ['Jazz'], versions: [2], tracks: ['Artist · Track'], scores: { mellow: 84 }, url: 'https://example.com/private-score-link' };
    const report = formatResultFeedback(context, ['fits', 'misses', 'unsure'], '  Specific mismatch  ', language);
    const copy = feedbackCopy(language, 'personal');
    for (const label of copy.categories) assert.ok(report.includes(label));
    assert.ok(report.includes('Specific mismatch'));
    assert.ok(report.includes('Artist · Track'));
    assert.ok(!report.includes('mellow') && !report.includes('84') && !report.includes('https://'));
  }
});

test('pair feedback uses explanation labels and ignores unanswered ratings or overlong comments', () => {
  const report = formatResultFeedback({ kind: 'pair', genres: ['Ambient', 'Jazz'], versions: [2, 3], tracks: ['A · Song'] }, ['', 'fits', ''], 'X'.repeat(600), 'ko');
  assert.ok(report.includes('공통점·차이점 설명: 잘 맞아요'));
  assert.ok(!report.includes('점수 설명의 이해도:'));
  assert.ok(report.includes('2 / 3'));
  assert.ok(report.endsWith('X'.repeat(500)));
  assert.ok(!report.includes('X'.repeat(501)));
});
