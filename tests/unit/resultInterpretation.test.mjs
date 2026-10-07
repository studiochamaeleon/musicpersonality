import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { interpretResult, resultInterpretationCopy, exploratoryIdentity } from '../../src/lib/resultInterpretation.ts';
import { rankResultGenres } from '../../src/lib/resultRanking.ts';
import { restoreSurveyDraft } from '../../src/lib/surveySession.ts';
import { KOREAN_GLYPHS } from '../../cloudflare/koreanGlyphs.ts';
import { JAPANESE_GLYPHS } from '../../cloudflare/japaneseGlyphs.ts';
import { questionsJa } from '../../src/locales/questionsJa.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url)));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url)));
const flat = value => ({ mellow: value, unpretentious: value, sophisticated: value, intense: value, contemporary: value });
test('uniform profiles receive explanatory framing without changing their ranking or score', () => {
  for (const [value, kind] of [[0, 'explore'], [25, 'even'], [50, 'neutral'], [75, 'broad'], [100, 'broad']]) {
    const before = rankResultGenres(flat(value), genres, 3);
    assert.equal(interpretResult(flat(value), genres, 3).kind, kind);
    assert.deepEqual(rankResultGenres(flat(value), genres, 3), before);
  }
});
test('nearby genres and precise catalogue profiles are distinguished using the same raw ranking', () => {
  const scores = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
  for (const version of [2, 3]) {
    const result = interpretResult(scores, genres, version);
    assert.equal(result.kind, 'nearby');
    assert.ok(result.gap <= 3);
  }
  for (const genre of genres) {
    assert.equal(interpretResult(genre.personalityProfile, genres, 3).kind, 'clear', genre.id);
  }
  assert.equal(interpretResult(flat(50), [], 3).kind, 'explore');
});
test('each language supplies a note for exploratory cases and every OG label has bitmap glyphs', () => {
  for (const lang of ['ko', 'en', 'ja']) {
    for (const kind of ['neutral', 'broad', 'even', 'explore', 'nearby', 'clear']) {
      const copy = resultInterpretationCopy(kind, lang);
      assert.ok(copy.badge.length > 0);
      assert.equal(Boolean(copy.note), kind !== 'clear');
      assert.equal(Boolean(copy.cardNote), kind !== 'clear');
      if (lang !== 'en') {
        const alphabet = lang === 'ko' ? /[가-힣]/g : /[぀-ヿ㐀-鿿々ー・]/g;
        const table = lang === 'ko' ? KOREAN_GLYPHS : JAPANESE_GLYPHS;
        for (const char of copy.badge.match(alphabet) || []) assert.ok(table[char], lang + char);
      }
    }
    assert.ok(exploratoryIdentity(lang).opening);
    assert.equal(exploratoryIdentity(lang).ending, '');
  }
});
test('rewritten questions keep the scoring schema, align sound-intensity concepts, and reject old drafts', () => {
  assert.equal(questions.length, 40);
  for (const category of ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary']) {
    assert.equal(questions.filter(q => q.category === category).length, 8);
  }
  for (const id of ['intense_2', 'intense_3', 'intense_4', 'intense_7']) {
    const q = questions.find(q => q.id === id);
    assert.ok(q.text && q.textEn && questionsJa[id]);
    assert.doesNotMatch(q.text, /감정|가사|어두운|드라마/);
    assert.doesNotMatch(q.textEn, /emotion|lyrics|dark|drama/i);
    assert.equal(q.weight, 1);
  }
  assert.match(questions.find(q => q.id === 'unpretentious_8').textEn, /traditional forms/);
  assert.match(questionsJa.unpretentious_8, /伝統的な形式/);
  assert.match(questions.find(q => q.id === 'contemporary_6').textEn, /electronic beats/);
  const draft = { questionVersion: 2, currentStep: 3, answers: { mellow_1: 4 } };
  assert.equal(restoreSurveyDraft(draft, questions), null);
  assert.equal(restoreSurveyDraft({ ...draft, questionVersion: 3 }, questions).answers.mellow_1, 4);
});
