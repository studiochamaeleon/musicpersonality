import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparisonHash, parseComparisonHash } from '../../src/lib/compatibility.ts';
import { createAppHash } from '../../cloudflare/sharePayload.ts';

const host = { mellow: 82, unpretentious: 46, sophisticated: 74, intense: 31, contemporary: 68 };
const guest = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };

test('each comparison listener keeps their own legacy result version', () => {
  for (const hostVersion of [2, 3]) for (const guestVersion of [2, 3]) {
    const hash = createComparisonHash(host, guest, { hostVersion, guestVersion });
    assert.deepEqual(parseComparisonHash(hash), { hostScores: host, guestScores: guest, hostVersion, guestVersion });
  }
});

test('existing versionless comparison links retain the current comparison default', () => {
  const hash = createComparisonHash(host, guest);
  assert.doesNotMatch(hash, /hv=|gv=/);
  assert.equal(parseComparisonHash(hash).hostVersion, 3);
  assert.equal(parseComparisonHash(hash).guestVersion, 3);
});

test('Cloudflare share handoff carries both versions into the client hash', () => {
  const destination = createAppHash('v1.82.46.74.31.68', 'v1.70.61.79.48.75', 'ja', '2', '2');
  assert.match(destination, /lang=ja/);
  assert.equal(parseComparisonHash(destination.split('#')[1]).hostVersion, 2);
  assert.equal(parseComparisonHash(destination.split('#')[1]).guestVersion, 2);
});
