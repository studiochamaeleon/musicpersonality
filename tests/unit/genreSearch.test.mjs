import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { artistSearchFields, buildGenreSearchIndex, matchesGenreSearch, normalizeGenreSearch } from '../../src/lib/genreSearch.ts';

const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const index = buildGenreSearchIndex(genres, catalog);
const matches = query => genres.filter(genre => matchesGenreSearch(index.get(genre.id), query)).map(genre => genre.id);

test('genre search normalizes spacing, punctuation, case, and full-width input without dropping Japanese letters', () => {
  assert.equal(normalizeGenreSearch('  Ｋ－ＰＯＰ  '), 'kpop');
  assert.equal(normalizeGenreSearch('R＆B'), 'rb');
  assert.equal(normalizeGenreSearch('New Jeans'), 'newjeans');
  assert.equal(normalizeGenreSearch('クール・ジャズ'), 'クールジャズ');
  assert.equal(matchesGenreSearch(['kpop'], ' K Pop '), true);
  assert.equal(matchesGenreSearch(['rb'], 'Ｒ＆Ｂ'), true);
  assert.equal(matchesGenreSearch(['kpop'], '___'), false);
  assert.equal(matchesGenreSearch(['kpop'], ' \t '), true);
});

test('original and translated genre names can be searched regardless of the current UI language', () => {
  for (const query of ['KPOP', 'K-POP', 'Ｋ ＰＯＰ', '케이팝']) assert.ok(matches(query).includes('pop_kpop'), query);
  for (const query of ['Cool Jazz', '쿨 재즈', 'クール・ジャズ']) assert.ok(matches(query).includes('jazz_cool'), query);
  assert.ok(matches('R＆B').includes('rnb_classic'));
  assert.equal(matches('no-music-match-9834').length, 0);
});

test('curated artist names and crossover aliases find only genres connected to those references', () => {
  assert.deepEqual(matches('NewJeans').sort(), ['pop_dream', 'pop_kpop']);
  assert.deepEqual(matches('뉴진스').sort(), ['pop_dream', 'pop_kpop']);
  assert.deepEqual(matches('New Jeans').sort(), ['pop_dream', 'pop_kpop']);
  assert.deepEqual(matches('Dua Lipa').sort(), ['pop_mainstream', 'pop_synthpop']);
  assert.ok(matches('Nujabes').includes('hiphop_jazzhop'));
  assert.ok(matches('누자베스').includes('hiphop_jazzhop'));
});

test('curated album and track titles remain searchable and can identify a matching crossover artist', () => {
  for (const artist of catalog.crossovers) {
    for (const query of [artist.album.title, artist.track.title]) {
      for (const genreId of artist.genreIds) assert.ok(matches(query).includes(genreId), `${artist.name}: ${query}: ${genreId}`);
      assert.equal(matchesGenreSearch(artistSearchFields(artist), query), true);
    }
  }
  const weeknd = catalog.crossovers.find(artist => artist.name === 'The Weeknd');
  assert.equal(matchesGenreSearch(artistSearchFields(weeknd), '더 위켄드'), true);
  assert.equal(matchesGenreSearch(artistSearchFields(weeknd), 'Nujabes'), false);
});

test('building and using the genre index does not mutate profiles or music references and accepts a missing crossover list', () => {
  const before = JSON.stringify({ genres, catalog });
  buildGenreSearchIndex(genres, catalog);
  matches('NewJeans');
  assert.equal(JSON.stringify({ genres, catalog }), before);
  const emptyCatalog = { version: 1, reviewedAt: '', genres: {} };
  const withoutArtists = buildGenreSearchIndex(genres, emptyCatalog);
  assert.equal(matchesGenreSearch(withoutArtists.get('pop_kpop'), 'KPOP'), true);
  assert.equal(matchesGenreSearch(withoutArtists.get('pop_kpop'), 'NewJeans'), false);
  assert.equal(matchesGenreSearch([], ''), true);
  assert.equal(matchesGenreSearch([], 'NewJeans'), false);
});
