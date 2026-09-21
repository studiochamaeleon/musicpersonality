import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genreTranslations } from '../../src/lib/genreTranslations.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));
const catalogue = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));

test('all 32 result types have a complete Korean and English analysis', () => {
  assert.equal(genres.length, 32);
  for (const genre of genres) {
    const translated = genreTranslations[genre.id];
    assert.ok(translated, `${genre.id}: English translation missing`);
    for (const analysis of [genre.personalityAnalysis, translated.personalityAnalysis]) {
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
    assert.ok(Number.isFinite(question.weight) && question.weight > 0, question.id);
  }
});
