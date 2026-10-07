import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalSurveyComparisonHash, restoreSurveyDraft, resumableSurveyDraft, surveyAnswerProgress, surveyShortcutAnswer } from '../../src/lib/surveySession.ts';
import { SURVEY_VERSION } from '../../src/lib/surveyVersion.ts';

const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-04T00:00:00.000Z');
const draft = overrides => ({ currentStep: 3, answers: { [questions[0].id]: 4, [questions[1].id]: 3 }, startTime: '2026-10-03T12:00:00.000Z', questionVersion: SURVEY_VERSION, ...overrides });

test('valid drafts preserve the selected question, usable answers, and start date', () => {
  const state = restoreSurveyDraft(draft(), questions, now);
  assert.equal(state.currentStep, 3);
  assert.deepEqual(state.answers, draft().answers);
  assert.equal(state.startTime.toISOString(), '2026-10-03T12:00:00.000Z');
  assert.equal(state.isComplete, false);
});

test('fractional, non-finite, and non-numeric saved steps resume at the first unanswered question', () => {
  for (const currentStep of [2.5, Number.NaN, Infinity, -Infinity, 'bad', '2', null, undefined, {}]) {
    const state = restoreSurveyDraft(draft({ currentStep }), questions, now);
    assert.equal(state.currentStep, 3);
    assert.ok(questions[state.currentStep - 1]);
    assert.deepEqual(state.answers, draft().answers);
  }
  for (const [currentStep, expected] of [[-2, 1], [0, 1], [500, questions.length]]) {
    assert.equal(restoreSurveyDraft(draft({ currentStep }), questions, now).currentStep, expected);
  }
});

test('restoration rejects incompatible drafts and never restores forged completion or scores', () => {
  for (const value of [null, [], 'draft', 2, {}, draft({ questionVersion: SURVEY_VERSION - 1 })]) {
    assert.equal(restoreSurveyDraft(value, questions, now), null);
  }
  const answers = Object.fromEntries(questions.map(question => [question.id, 3]));
  const state = restoreSurveyDraft(draft({ currentStep: 'bad', answers, isComplete: true, personalityScores: { mellow: 100 } }), questions, now);
  assert.equal(state.currentStep, questions.length);
  assert.equal(state.isComplete, false);
  assert.equal(state.personalityScores, undefined);
});

test('bad dates and answers are repaired while valid answers remain available for correction', () => {
  const answers = { ...draft().answers, [questions[2].id]: '3', [questions[3].id]: 8, unknown: 5 };
  const state = restoreSurveyDraft(draft({ answers, startTime: 'invalid' }), questions, now);
  assert.deepEqual(state.answers, draft().answers);
  assert.equal(state.startTime, now);
  assert.deepEqual(restoreSurveyDraft(draft({ answers: null, startTime: null }), questions, now).answers, {});
});

const press = overrides => ({ key: '3', ctrlKey: false, metaKey: false, altKey: false, repeat: false, isComposing: false, defaultPrevented: false, ...overrides });

test('only plain in-range numeric keys answer the survey', () => {
  for (const key of ['1', '2', '3', '4', '5']) assert.equal(surveyShortcutAnswer(press({ key }), 5), Number(key));
  for (const key of ['0', '6', ' ', '', '3.0', 'ArrowRight', 'Enter']) assert.equal(surveyShortcutAnswer(press({ key }), 5), null);
  assert.equal(surveyShortcutAnswer(press({ key: '7' }), 7), 7);
});

test('browser modifiers, composing input, repeated keys, handled events, and editors cannot answer', () => {
  for (const blocked of ['ctrlKey', 'metaKey', 'altKey', 'repeat', 'isComposing', 'defaultPrevented']) {
    assert.equal(surveyShortcutAnswer(press({ [blocked]: true }), 5), null);
  }
  assert.equal(surveyShortcutAnswer(press(), 5, true), null);
});

test('answer progress counts only valid current questions and is independent of the question position', () => {
  assert.deepEqual(surveyAnswerProgress(questions, {}), { answeredCount: 0, percentage: 0 });
  assert.deepEqual(surveyAnswerProgress(questions, { [questions[0].id]: 4, [questions[1].id]: '3', unknown: 5 }), { answeredCount: 1, percentage: 2.5 });
  const answers = Object.fromEntries(questions.slice(0, -1).map(question => [question.id, 3]));
  assert.deepEqual(surveyAnswerProgress(questions, answers), { answeredCount: 39, percentage: 97.5 });
  answers[questions.at(-1).id] = 3;
  assert.deepEqual(surveyAnswerProgress(questions, answers), { answeredCount: 40, percentage: 100 });
  assert.deepEqual(surveyAnswerProgress([], {}), { answeredCount: 0, percentage: 0 });
});

test('resume choices require an unfinished compatible draft with usable answers', () => {
  assert.equal(resumableSurveyDraft(draft({ answers: {} }), questions, now), null);
  assert.equal(resumableSurveyDraft(draft({ isComplete: true }), questions, now), null);
  assert.equal(resumableSurveyDraft(draft({ questionVersion: SURVEY_VERSION - 1 }), questions, now), null);
  assert.equal(resumableSurveyDraft(draft({ answers: { [questions[0].id]: '4' } }), questions, now), null);
  assert.equal(resumableSurveyDraft(draft(), questions, now).comparisonHash, null);
});

test('comparison drafts retain only canonical host scores and the host result version', () => {
  const invitation = 'compare=v1.82.46.74.31.68&hv=2';
  assert.equal(canonicalSurveyComparisonHash(`#${invitation}&extra=ignored`), invitation);
  assert.equal(canonicalSurveyComparisonHash('compare=v1.82.46.74.31.68&hv=3'), 'compare=v1.82.46.74.31.68');
  assert.equal(restoreSurveyDraft(draft({ comparisonHash: invitation }), questions, now).comparisonHash, invitation);
  assert.equal(resumableSurveyDraft(draft({ comparisonHash: invitation }), questions, now).comparisonHash, invitation);
});

test('corrupt comparison contexts and completed pair links cannot be restored as personal drafts', () => {
  for (const comparisonHash of ['broken', 'compare=v1.101.46.74.31.68', 'compare=v1.82.46.74.31.68&hv=99', 'compare=v1.82.46.74.31.68&guest=broken', 'compare=v1.82.46.74.31.68&gv=2', 'compare=v1.82.46.74.31.68&compare=v1.20.30.40.50.60', 'compare=v1.82.46.74.31.68&hv=2&hv=3', 5]) {
    assert.equal(canonicalSurveyComparisonHash(comparisonHash), null);
    assert.equal(restoreSurveyDraft(draft({ comparisonHash }), questions, now), null);
  }
});
