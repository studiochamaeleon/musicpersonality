import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadRecentComparisons, saveRecentComparison, saveRecentComparisonWithStatus, deleteRecentComparison, parseRecentComparisons } from '../../src/lib/recentComparisons.ts';

const profile = value => ({ mellow: value, unpretentious: value, sophisticated: value, intense: value, contemporary: value });
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

test('recent matches cap at three, deduplicate, and preserve ordered participants and versions', () => {
  for (let index = 1; index <= 4; index++) saveRecentComparison(profile(20), profile(index * 10), 2, 3);
  assert.equal(loadRecentComparisons().length, 3);
  assert.equal(loadRecentComparisons()[0].guestScores.mellow, 40);
  const reopened = saveRecentComparison(profile(20), profile(30), 2, 3);
  assert.equal(reopened.length, 3);
  assert.equal(reopened[0].guestScores.mellow, 30);
  assert.equal(reopened[0].hostVersion, 2);
  assert.equal(reopened[0].guestVersion, 3);
  const swapped = saveRecentComparison(profile(30), profile(20), 3, 2);
  assert.equal(swapped[0].hostScores.mellow, 30);
});

test('deleting one match preserves the others and deleting the last removes stored history', () => {
  saveRecentComparison(profile(20), profile(30), 2, 3);
  const rows = saveRecentComparison(profile(40), profile(50), 3, 3);
  const remaining = deleteRecentComparison(rows[0].id);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].hostScores.mellow, 20);
  assert.deepEqual(deleteRecentComparison(remaining[0].id), []);
  assert.deepEqual(loadRecentComparisons(), []);
});

test('corrupted, future-version, and malformed stored rows are rejected without retaining extra metadata', () => {
  const good = { hostScores: profile(20), guestScores: profile(30), hostVersion: 2, guestVersion: 3, createdAt: 123, name: 'do not retain' };
  assert.deepEqual(parseRecentComparisons('{broken'), []);
  const parsed = parseRecentComparisons(JSON.stringify([good, { ...good, hostVersion: 99 }, { ...good, guestScores: profile(-1) }, { ...good, createdAt: '123' }]));
  assert.equal(parsed.length, 1);
  assert.equal(Object.hasOwn(parsed[0], 'name'), false);
  assert.deepEqual(parseRecentComparisons(JSON.stringify([{ ...good, guestScores: profile(1.5) }])), []);
});

test('blocked storage and non-finite scores leave the workflow usable without a fake save', () => {
  assert.deepEqual(saveRecentComparison(profile(NaN), profile(30), 3, 3), []);
  Object.defineProperty(globalThis.window, 'localStorage', { get() { throw new Error('denied'); } });
  assert.deepEqual(loadRecentComparisons(), []);
  assert.deepEqual(saveRecentComparison(profile(20), profile(30), 3, 3), []);
  assert.deepEqual(deleteRecentComparison('missing'), []);
});

test('comparison save status distinguishes a new write from failure while keeping existing matches', () => {
  const first = saveRecentComparisonWithStatus(profile(20), profile(30), 2, 3);
  assert.equal(first.saved, true);
  assert.equal(first.results[0].hostVersion, 2);
  window.localStorage.setItem = () => { throw new Error('denied'); };
  const blocked = saveRecentComparisonWithStatus(profile(40), profile(50), 3, 3);
  assert.equal(blocked.saved, false);
  assert.deepEqual(blocked.results, first.results);
  assert.equal(saveRecentComparisonWithStatus(profile(NaN), profile(30), 3, 3).saved, false);
  assert.equal(saveRecentComparisonWithStatus(profile(20), profile(30), 99, 3).saved, false);
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  assert.deepEqual(saveRecentComparisonWithStatus(profile(20), profile(30), 3, 3), { saved: false, results: [] });
});

test('server-side comparison writes explicitly report unsaved rather than claiming a recent match', () => {
  delete globalThis.window;
  assert.deepEqual(saveRecentComparisonWithStatus(profile(20), profile(30), 3, 3), { saved: false, results: [] });
});
