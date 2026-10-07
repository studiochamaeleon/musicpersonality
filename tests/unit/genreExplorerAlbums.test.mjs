import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectGenreExplorerAlbums } from '../../src/lib/genreExplorerAlbums.ts';
import { buildGenreSearchIndex, matchesGenreSearch } from '../../src/lib/genreSearch.ts';
import { planArtistRecommendations } from '../../src/lib/artistRecommendations.ts';

const read = file => JSON.parse(readFileSync(new URL('../../src/data/' + file, import.meta.url), 'utf8'));
const catalog = read('musicCatalog.json');
const exploration = read('genreExplorerAlbums.json');
const genres = read('genres.json');

test('all 34 exploration profiles offer exactly six distinct artists and verified-format album links', () => {
  assert.equal(genres.length, 34);
  const known = new Set(genres.map(genre => genre.id));
  for (const id of Object.keys(exploration.genres)) assert.ok(known.has(id));
  for (const genre of genres) {
    const picks = selectGenreExplorerAlbums(genre.id, catalog, exploration);
    assert.equal(picks.length, 6, genre.id);
    assert.equal(new Set(picks.map(artist => artist.name.toLowerCase())).size, 6, genre.id);
    assert.equal(new Set(picks.map(artist => artist.album.spotifyUrl)).size, 6, genre.id);
    assert.equal(picks[0].role, 'anchor');
    assert.ok(picks.some(artist => artist.album.year >= 2020), genre.id + ': retain a modern gateway');
    for (const artist of picks) {
      assert.ok(artist.nameKo?.trim() && artist.album.title.trim());
      assert.ok(Number.isInteger(artist.album.year) && artist.album.year >= 1900 && artist.album.year <= 2026);
      assert.match(artist.album.spotifyUrl, /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/);
    }
  }
});

test('every supplementary artist and album is searchable and remains visible in the six picks', () => {
  const index = buildGenreSearchIndex(genres, catalog, exploration.genres);
  for (const [genreId, artists] of Object.entries(exploration.genres)) {
    for (const artist of artists) for (const query of [artist.name, artist.nameKo, artist.album.title]) {
      assert.ok(matchesGenreSearch(index.get(genreId), query), genreId + ': ' + query);
      assert.ok(selectGenreExplorerAlbums(genreId, catalog, exploration, query).includes(artist), query);
    }
  }
});

test('scene mode keeps six choices and moves matching Japanese references forward without hiding genre artists', () => {
  for (const bridge of catalog.crossovers.filter(artist => artist.scene === 'jpop')) for (const id of bridge.genreIds) {
    const picks = selectGenreExplorerAlbums(id, catalog, exploration, '', true);
    assert.equal(picks.length, 6);
    assert.equal(picks[0].role, 'anchor');
    assert.equal(picks[1].name, bridge.name);
  }
  assert.ok(selectGenreExplorerAlbums('pop_synthpop', catalog, exploration, 'Dua Lipa').some(artist => artist.name === 'Dua Lipa'));
});

test('exploration never mutates or expands personal result recommendations', () => {
  const before = JSON.stringify({ catalog, exploration });
  for (const genre of genres) {
    const ranks = [{ genreId: genre.id, compatibility: 90 }];
    const original = planArtistRecommendations(ranks, catalog);
    selectGenreExplorerAlbums(genre.id, catalog, exploration, 'Radiohead');
    assert.deepEqual(planArtistRecommendations(ranks, catalog), original);
  }
  assert.equal(JSON.stringify({ catalog, exploration }), before);
});

test('duplicate artist names and albums are removed before applying the display limit', () => {
  const original = catalog.genres.jazz_cool[0];
  const extras = exploration.genres.jazz_cool;
  const duplicate = { ...original, name: ' Ｍｉｌｅｓ Ｄａｖｉｓ ', album: extras[0].album };
  const fixture = { ...exploration, genres: { ...exploration.genres, jazz_cool: [duplicate, ...extras] } };
  assert.deepEqual(selectGenreExplorerAlbums('jazz_cool', catalog, fixture), selectGenreExplorerAlbums('jazz_cool', catalog, exploration));
  assert.deepEqual(selectGenreExplorerAlbums('unknown', { genres: {} }, { genres: {} }), []);
});
