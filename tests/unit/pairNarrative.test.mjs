import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePairCompatibility } from '../../src/lib/compatibility.ts';
import { buildPairNarrative, describePairTrait, pairTrackReason, pairLabels } from '../../src/lib/pairNarrative.ts';

const profile = value => ({ mellow: value, unpretentious: value, sophisticated: value, intense: value, contemporary: value });

test('identical neutral profiles do not invent a difference or promise identical songs', () => {
  for (const language of ['ko', 'en', 'ja']) {
    const pair = calculatePairCompatibility(profile(50), profile(50), language);
    const narrative = buildPairNarrative(pair, language);
    assert.equal(pair.score, 100);
    assert.equal(narrative.identical, true);
    assert.equal(narrative.closest.length, 5);
    assert.equal(narrative.contrasts.length, 5);
    assert.ok(narrative.summary.length && narrative.advice.length && narrative.shareLine.length);
    assert.notEqual(narrative.traitNotes.intense, narrative.sharedText);
  }
  const narrative = buildPairNarrative(calculatePairCompatibility(profile(50), profile(50), 'ko'), 'ko');
  assert.match(narrative.contrastTitle, /차이가 없/);
  assert.match(narrative.sharedText, /좋아하는 곡까지 같다는 뜻은 아니/);
  assert.match(narrative.traitNotes.intense, /중간/);
});

test('fully separated profiles never assert a shared taste bridge', () => {
  for (const language of ['ko', 'en', 'ja']) {
    const pair = calculatePairCompatibility(profile(0), profile(100), language);
    const narrative = buildPairNarrative(pair, language);
    assert.equal(pair.score, 0);
    assert.equal(narrative.hasCommonGround, false);
    assert.equal(narrative.closest.length, 5);
    assert.doesNotMatch(pair.description, /잇는 접점|is the bridge|つなぐ接点/);
  }
});

test('a low matched intensity means restraint rather than strong energy', () => {
  const pair = calculatePairCompatibility({ ...profile(70), intense: 25 }, { ...profile(70), intense: 30 }, 'ko');
  assert.match(describePairTrait(pair.traits.find(item => item.key === 'intense'), 'ko'), /절제된 사운드/);
  assert.match(describePairTrait({ ...pair.traits[3], host: 85, guest: 80, difference: 5 }, 'ko'), /강한 에너지/);
  assert.match(describePairTrait({ ...pair.traits[3], host: 55, guest: 75, difference: 20 }, 'ko'), /모두 높거나 낮은 응답은 아니/);
});

test('equal gaps report ties instead of choosing the first axis as the only difference', () => {
  const narrative = buildPairNarrative(calculatePairCompatibility(profile(60), profile(35), 'ko'), 'ko');
  assert.equal(narrative.contrasts.length, 5);
  assert.match(narrative.contrastText, /여러 축/);
  assert.equal(narrative.hasCommonGround, false);
});

test('directional notes follow the scored participant, not whoever opens the link', () => {
  const pair = calculatePairCompatibility({ ...profile(50), intense: 90 }, { ...profile(50), intense: 20 }, 'ko');
  assert.match(describePairTrait(pair.traits[3], 'ko'), /^초대한 사람/);
  const swapped = calculatePairCompatibility({ ...profile(50), intense: 20 }, { ...profile(50), intense: 90 }, 'ko');
  assert.equal(pair.score, swapped.score);
  assert.match(describePairTrait(swapped.traits[3], 'ko'), /^응답한 사람/);
  assert.deepEqual(pairLabels('en'), { host: 'Inviter', guest: 'Respondent' });
});

test('track explanations distinguish a common entry from an unfamiliar compromise', () => {
  assert.match(pairTrackReason('shared', 90, 30, 'ko'), /공통 취향이라는 뜻은 아니/);
  assert.match(pairTrackReason('shared', 80, 70, 'ko'), /낮은 쪽도 비교적 가까운/);
  assert.match(pairTrackReason('host', 90, 30, 'ko'), /초대한 사람/);
  assert.match(pairTrackReason('guest', 20, 90, 'ja'), /回答した人/);
});
