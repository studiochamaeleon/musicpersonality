import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genreTranslations } from '../../src/lib/genreTranslations.ts';
import { buildJapaneseAnalysis, genreTranslationsJa } from '../../src/lib/genreTranslationsJa.ts';
import { questionsJa } from '../../src/locales/questionsJa.ts';
import { KOREAN_GLYPHS } from '../../cloudflare/koreanGlyphs.ts';
import { JAPANESE_GLYPHS } from '../../cloudflare/japaneseGlyphs.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));
const catalogue = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));

test('all 32 result types have a complete Korean, English, and Japanese analysis', () => {
  assert.equal(genres.length, 32);
  for (const genre of genres) {
    const translated = genreTranslations[genre.id];
    const japanese = genreTranslationsJa[genre.id];
    assert.ok(translated, `${genre.id}: English translation missing`);
    assert.ok(japanese, `${genre.id}: Japanese translation missing`);
    assert.ok(japanese.name?.trim() && japanese.typeTitle?.trim() && japanese.description?.trim(), `${genre.id}: incomplete Japanese summary`);
    assert.ok(japanese.characteristics?.length >= 3, `${genre.id}: Japanese characteristics missing`);
    const japaneseAnalysis = buildJapaneseAnalysis(genre.id, genre.personalityAnalysis);
    for (const analysis of [genre.personalityAnalysis, translated.personalityAnalysis, japaneseAnalysis]) {
      assert.ok(analysis?.typeTitle?.trim(), `${genre.id}: type title missing`);
      assert.ok(analysis?.description?.trim(), `${genre.id}: description missing`);
      assert.ok(analysis?.relationshipCompatibility?.trim(), `${genre.id}: relationship note missing`);
      for (const key of ['coreTraits', 'lifestyleInsights', 'strengths', 'challenges', 'musicPreferences', 'recommendedActivities']) {
        assert.ok(analysis[key]?.length > 0, `${genre.id}: ${key} missing`);
      }
      for (const trait of analysis.coreTraits) {
        assert.ok(trait.traitName?.trim() && trait.description?.trim() && trait.impact?.trim(), `${genre.id}: incomplete trait`);
      }
    }
    for (const key of ['popularity', 'energy', 'valence', 'acousticness']) {
      assert.ok(Number.isFinite(genre[key]) && genre[key] >= 0 && genre[key] <= 100, `${genre.id}: ${key} out of range`);
    }
    assert.equal(catalogue.genres[genre.id]?.length, 2, `${genre.id}: expected anchor and discovery albums`);
  }
});

test('the survey preserves eight valid questions per MUSIC dimension', () => {
  assert.equal(questions.length, 40);
  for (const key of ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary']) {
    assert.equal(questions.filter(question => question.category === key).length, 8);
  }
  for (const question of questions) {
    assert.ok(question.text?.trim() && question.textEn?.trim(), question.id);
    assert.ok(questionsJa[question.id]?.trim(), `${question.id}: Japanese question missing`);
    assert.ok(Number.isFinite(question.weight) && question.weight > 0, question.id);
  }
});

test('Japanese locale keeps the same complete key structure as English', () => {
  const english = JSON.parse(readFileSync(new URL('../../src/locales/en.json', import.meta.url), 'utf8'));
  const japanese = JSON.parse(readFileSync(new URL('../../src/locales/ja.json', import.meta.url), 'utf8'));
  const walk = (source, target, path = '') => {
    for (const [key, value] of Object.entries(source)) {
      const nextPath = path ? `${path}.${key}` : key;
      assert.ok(Object.hasOwn(target, key), `${nextPath}: Japanese locale key missing`);
      if (value && typeof value === 'object' && !Array.isArray(value)) walk(value, target[key], nextPath);
      else if (Array.isArray(value)) assert.ok(Array.isArray(target[key]) && target[key].length > 0, `${nextPath}: Japanese locale array missing`);
      else assert.equal(typeof target[key], typeof value, `${nextPath}: Japanese locale value type differs`);
    }
  };
  walk(english, japanese);
});

test('every Korean result title and genre has an Open Graph bitmap glyph', () => {
  for (const genre of genres) {
    for (const label of [genre.nameKo, genre.personalityAnalysis?.typeTitle]) {
      for (const character of label.match(/[가-힣]/g) || []) {
        assert.equal(KOREAN_GLYPHS[character]?.length, 256, `${genre.id}: missing ${character}`);
      }
    }
  }
});

test('every Japanese result title, genre, and Open Graph label has a bitmap glyph', () => {
  const labels = [
    '私の音楽性格', 'ジャンル一致度', 'あなたの音楽タイプは', '友達からの招待',
    '音楽の好みを比較', '二人の音楽相性', 'ほぼ同じプレイリスト', '一緒に聴くほど好相性',
    '似ている音と新しい音', '違う好みから発見',
    ...Object.values(genreTranslationsJa).flatMap(item => [item.name, item.typeTitle]),
  ];
  for (const label of labels) {
    for (const character of label.match(/[぀-ヿ㐀-鿿々ー・]/g) || []) {
      assert.equal(JAPANESE_GLYPHS[character]?.length, 256, `missing Japanese glyph: ${character}`);
    }
  }
});
