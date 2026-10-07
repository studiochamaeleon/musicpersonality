import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { deleteRecentResult, getRecentResultVersion, loadRecentResults, parseRecentResults, RECENT_RESULTS_STORAGE_KEY, saveRecentResult, saveRecentResultWithStatus } from '../../src/lib/recentResults.ts';

const profile = value => ({ mellow: value, unpretentious: value, sophisticated: value, intense: value, contemporary: value });
const row = (id, value, resultVersion = 3) => ({ id, scores: profile(value), topGenreId: 'pop_indie', createdAt: 123, resultVersion });
test('survey revision does not reclassify older v2-questionnaire results as legacy ranking', () => {
  for (const questionVersion of [2, 3]) {
    const { resultVersion, ...previous } = row('previous', 50);
    void resultVersion;
    const restored = parseRecentResults(JSON.stringify([{ ...previous, questionVersion }]));
    assert.equal(getRecentResultVersion(restored[0]), 3);
    assert.equal(getRecentResultVersion({ ...previous, questionVersion, resultVersion: 2 }), 2);
  }
});
let previousWindow;
beforeEach(() => {
  previousWindow = globalThis.window;
  const values = new Map();
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } };
});
afterEach(() => {
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});

test('a new result does not erase an identical legacy profile with a different interpretation', () => {
  window.localStorage.setItem(RECENT_RESULTS_STORAGE_KEY, JSON.stringify([row('legacy', 50, 2)]));
  const results = saveRecentResult(profile(50), 'hiphop_jazz');
  assert.equal(results.length, 2);
  assert.equal(getRecentResultVersion(results[0]), 3);
  assert.equal(getRecentResultVersion(results[1]), 2);
  assert.equal(results[1].id, 'legacy');
  assert.equal(saveRecentResult(profile(50), 'hiphop_jazz').length, 2);
});

test('recent results deduplicate by version and scores and keep at most three', () => {
  const parsed = parseRecentResults(JSON.stringify([row('a', 50), row('duplicate', 50), row('legacy', 50, 2), row('b', 60), row('c', 70)]));
  assert.deepEqual(parsed.map(result => result.id), ['a', 'legacy', 'b']);
  for (const value of [10, 20, 30, 40]) saveRecentResult(profile(value), 'pop_indie');
  assert.deepEqual(loadRecentResults().map(result => result.scores.mellow), [40, 30, 20]);
});

test('invalid and unknown-version storage is rejected while documented legacy rows still restore', () => {
  const good = row('good', 50);
  const parsed = parseRecentResults(JSON.stringify([
    { ...good, name: 'do not retain', scores: { ...good.scores, name: 'do not retain' } },
    { ...row('future', 60), resultVersion: 99 },
    { ...row('future-survey', 70), questionVersion: 99 },
    { ...row('bad-date', 80), createdAt: -1 },
    { ...row('bad-scores', 90), scores: profile(101) },
  ]));
  assert.equal(parsed.length, 1);
  assert.equal(Object.hasOwn(parsed[0], 'name'), false);
  assert.equal(Object.hasOwn(parsed[0].scores, 'name'), false);
  const legacy = parseRecentResults(JSON.stringify([{ id: 'legacy', scores: profile(50), topGenreId: 'pop_indie', createdAt: 123 }]));
  assert.equal(getRecentResultVersion(legacy[0]), 2);
  assert.deepEqual(parseRecentResults('{broken'), []);
});

test('deleting a personal result keeps the other results and unrelated match history', () => {
  const matchKey = 'muti-recent-comparisons-v1';
  window.localStorage.setItem(matchKey, 'keep-match');
  window.localStorage.setItem(RECENT_RESULTS_STORAGE_KEY, JSON.stringify([row('a', 50), row('b', 60, 2)]));
  assert.deepEqual(deleteRecentResult('a').map(result => result.id), ['b']);
  assert.deepEqual(deleteRecentResult('b'), []);
  assert.equal(window.localStorage.getItem(RECENT_RESULTS_STORAGE_KEY), null);
  assert.equal(window.localStorage.getItem(matchKey), 'keep-match');
});

test('invalid inputs and blocked writes never claim a result was saved or deleted', () => {
  window.localStorage.setItem(RECENT_RESULTS_STORAGE_KEY, JSON.stringify([row('saved', 50)]));
  assert.deepEqual(saveRecentResult(profile(NaN), 'pop_indie').map(result => result.id), ['saved']);
  window.localStorage.setItem = () => { throw new Error('quota'); };
  window.localStorage.removeItem = () => { throw new Error('denied'); };
  assert.deepEqual(saveRecentResult(profile(60), 'pop_indie').map(result => result.id), ['saved']);
  assert.deepEqual(deleteRecentResult('saved').map(result => result.id), ['saved']);
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  assert.deepEqual(loadRecentResults(), []);
  assert.deepEqual(deleteRecentResult('saved'), []);
});

test('save status distinguishes a successful write from quota or unavailable storage without losing history', () => {
  const first = saveRecentResultWithStatus(profile(50), 'pop_indie');
  assert.equal(first.saved, true);
  assert.equal(first.results[0].scores.mellow, 50);
  window.localStorage.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  const blocked = saveRecentResultWithStatus(profile(60), 'hiphop_jazz');
  assert.equal(blocked.saved, false);
  assert.deepEqual(blocked.results, first.results);
  assert.equal(saveRecentResultWithStatus(profile(NaN), 'pop_indie').saved, false);
  assert.equal(saveRecentResultWithStatus(profile(70), '').saved, false);
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  assert.deepEqual(saveRecentResultWithStatus(profile(60), 'hiphop_jazz'), { saved: false, results: [] });
});

test('server-side save status is explicitly unsaved without accessing browser APIs', () => {
  delete globalThis.window;
  assert.deepEqual(saveRecentResultWithStatus(profile(50), 'pop_indie'), { saved: false, results: [] });
  assert.deepEqual(saveRecentResult(profile(50), 'pop_indie'), []);
});
