import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genreTranslations, getPersonalityAnalysis } from '../../src/lib/genreTranslations.ts';
import { genreTranslationsJa } from '../../src/lib/genreTranslationsJa.ts';
import { musicCharacterNotes } from '../../src/lib/musicCharacterAnalysis.ts';
import { questionsJa } from '../../src/locales/questionsJa.ts';
import { KOREAN_GLYPHS } from '../../cloudflare/koreanGlyphs.ts';
import { JAPANESE_GLYPHS } from '../../cloudflare/japaneseGlyphs.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));
const catalogue = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));

test('all 34 result types have a complete Korean, English, and Japanese analysis', () => {
  assert.equal(genres.length, 34);
  for (const genre of genres) {
    const translated = genreTranslations[genre.id];
    const japanese = genreTranslationsJa[genre.id];
    assert.ok(translated, `${genre.id}: English translation missing`);
    assert.ok(japanese, `${genre.id}: Japanese translation missing`);
    assert.ok(japanese.name?.trim() && japanese.typeTitle?.trim() && japanese.description?.trim(), `${genre.id}: incomplete Japanese summary`);
    assert.ok(japanese.characteristics?.length >= 3, `${genre.id}: Japanese characteristics missing`);
    assert.doesNotMatch(genre.personalityAnalysis.description, /당신은|타고난|완벽하게 반영/, `${genre.id}: Korean intro asserts a measured personality`);
    assert.doesNotMatch(translated.personalityAnalysis.description, /You are|You possess|You excel|perfectly reflects/, `${genre.id}: English intro asserts a measured personality`);
    assert.doesNotMatch(japanese.description, /タイプ|性格を測った結果です/, `${genre.id}: Japanese intro asserts a measured personality`);
    for (const language of ['ko', 'en', 'ja']) {
      assert.equal(musicCharacterNotes[genre.id]?.[language]?.length, 4, `${genre.id}/${language}: listening notes missing`);
      const analysis = getPersonalityAnalysis(genre.id, genre.personalityAnalysis, language, genre.characteristics);
      assert.ok(analysis?.typeTitle?.trim(), `${genre.id}: type title missing`);
      assert.ok(analysis?.description?.trim(), `${genre.id}: description missing`);
      assert.ok(analysis?.relationshipCompatibility?.trim(), `${genre.id}: relationship note missing`);
      for (const key of ['coreTraits', 'lifestyleInsights', 'strengths', 'challenges', 'musicPreferences', 'recommendedActivities']) {
        assert.ok(analysis[key]?.length > 0, `${genre.id}: ${key} missing`);
      }
      for (const trait of analysis.coreTraits) {
        assert.ok(trait.traitName?.trim() && trait.description?.trim() && trait.impact?.trim(), `${genre.id}: incomplete trait`);
      }
      const details = JSON.stringify({ ...analysis, typeTitle: '', description: '' });
      assert.doesNotMatch(details, /당신은|당신의 성격|타고난|파트너를 선호|You are|You possess|You excel|あなたの性格/, `${genre.id}/${language}: detailed notes assert personality`);
      assert.equal(analysis.coreTraits[0].description, musicCharacterNotes[genre.id][language][0]);
      assert.equal(analysis.lifestyleInsights[0], musicCharacterNotes[genre.id][language][3]);
    }
    for (const key of ['popularity', 'energy', 'valence', 'acousticness']) {
      assert.ok(Number.isFinite(genre[key]) && genre[key] >= 0 && genre[key] <= 100, `${genre.id}: ${key} out of range`);
    }
    assert.ok(catalogue.genres[genre.id]?.length >= 2 && catalogue.genres[genre.id]?.length <= 4, `${genre.id}: expected a bounded anchor/discovery selection`);
    assert.equal(catalogue.genres[genre.id].filter(artist => artist.role === 'anchor').length, 1, `${genre.id}: preserve one representative anchor`);
    assert.ok(catalogue.genres[genre.id].some(artist => artist.role === 'discovery' && artist.track.year >= 2020), `${genre.id}: a recent release or performance should be reachable`);
    for (const artist of catalogue.genres[genre.id]) {
      assert.ok(artist.track?.title?.trim(), `${genre.id}/${artist.name}: curated track missing`);
      assert.match(artist.track.spotifyUrl, /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
    }
  }
});

test('crossover tracks connect existing sounds with scenes rather than create a single J-pop personality', () => {
  assert.ok(catalogue.crossovers.length >= 7 && catalogue.crossovers.length <= 10);
  assert.equal(genres.some(genre => genre.id === 'pop_jpop'), false);
  const known = new Set(genres.map(genre => genre.id));
  for (const artist of catalogue.crossovers) {
    assert.equal(artist.role, 'bridge');
    assert.ok(artist.genreIds.length > 0);
    assert.ok(artist.genreIds.every(id => known.has(id)));
    assert.match(artist.track.spotifyUrl, /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
  }
  assert.equal(catalogue.crossovers.filter(artist => artist.scene === 'jpop').length, 2);
  assert.deepEqual(catalogue.crossovers.find(artist => artist.name === 'The Weeknd').genreIds, ['pop_synthpop', 'pop_mainstream']);
  assert.ok(catalogue.crossovers.find(artist => artist.name === 'ILLIT').genreIds.includes('electronic_house'));
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
  assert.doesNotMatch(questions.find(question => question.id === 'mellow_4').text, /시끄럽/);
  assert.doesNotMatch(questions.filter(question => question.category === 'contemporary').map(question => question.text).join(' '), /소셜미디어|스트리밍|최신|과거의 음악/);
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
