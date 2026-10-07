import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pairTrackAlternatives, rankPairGenres, recommendPairTracks, rotatePairTrack } from '../../src/lib/compatibilityTracks.ts';
import { rankResultGenres } from '../../src/lib/resultRanking.ts';

const catalog = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const host = { mellow: 82, unpretentious: 46, sophisticated: 74, intense: 31, contemporary: 68 };
const guest = { mellow: 20, unpretentious: 65, sophisticated: 30, intense: 90, contemporary: 95 };

test('pair tracks provide a shared start and one distinct introduction per listener', () => {
  const picks = recommendPairTracks(host, guest, genres, catalog);
  assert.equal(picks.length, 3);
  assert.equal(picks[0].role, 'shared');
  assert.equal(picks[1].role, 'host');
  assert.equal(picks[2].role, 'guest');
  assert.equal(picks[0].genreId, rankPairGenres(host, guest, genres)[0].genreId);
  assert.equal(picks[1].genreId, rankResultGenres(host, genres, 3)[0].genre.id);
  assert.equal(picks[2].genreId, rankResultGenres(guest, genres, 3)[0].genre.id);
  assert.equal(new Set(picks.map(pick => pick.artist.track.spotifyUrl)).size, 3);
  for (const pick of picks) assert.match(pick.artist.track.spotifyUrl, /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
});

test('identical listeners still receive three unique tracks without changing their stored version', () => {
  const picks = recommendPairTracks(host, host, genres, catalog, 2, 2);
  assert.equal(picks.length, 3);
  assert.equal(picks[1].genreId, rankResultGenres(host, genres, 2)[0].genre.id);
  assert.equal(new Set(picks.map(pick => pick.artist.track.spotifyUrl)).size, 3);
});

test('shared ranking protects the weaker match instead of hiding it in an average', () => {
  const profile = value => ({ mellow: value, unpretentious: value, sophisticated: value, intense: value, contemporary: value });
  const ranked = rankPairGenres(profile(0), profile(100), [
    { id: 'one-sided', personalityProfile: profile(10) },
    { id: 'balanced', personalityProfile: profile(50) },
  ]);
  assert.equal(ranked[0].genreId, 'balanced');
  assert.equal(ranked[0].compatibility, 50);
  assert.equal(ranked[1].hostCompatibility, 90);
  assert.equal(ranked[1].guestCompatibility, 10);
  assert.deepEqual(rankPairGenres(profile(100), profile(0), [
    { id: 'one-sided', personalityProfile: profile(10) },
    { id: 'balanced', personalityProfile: profile(50) },
  ]).map(item => item.genreId), ranked.map(item => item.genreId));
});

test('missing catalogue entries are skipped without duplicate or broken recommendations', () => {
  assert.deepEqual(recommendPairTracks(host, guest, genres, { genres: {} }), []);
});

test('track rotation preserves roles, stays in nearby curated genres, and never duplicates a slot', () => {
  for (const version of [2, 3]) {
    let picks = recommendPairTracks(host, guest, genres, catalog, version, version);
    for (let round = 0; round < 20; round++) {
      const index = round % 3;
      const before = picks[index].artist.track.spotifyUrl;
      const options = pairTrackAlternatives(picks, index, host, guest, genres, catalog, version, version);
      picks = rotatePairTrack(picks, index, host, guest, genres, catalog, version, version);
      assert.equal(new Set(picks.map(pick => pick.artist.track.spotifyUrl)).size, 3);
      assert.deepEqual(picks.map(pick => pick.role), ['shared', 'host', 'guest']);
      if (options.length > 1) assert.notEqual(picks[index].artist.track.spotifyUrl, before);
      const ranking = index === 0 ? rankPairGenres(host, guest, genres).slice(0, 3).map(item => item.genreId)
        : rankResultGenres(index === 1 ? host : guest, genres, version).slice(0, 3).map(item => item.genre.id);
      assert.ok(ranking.includes(picks[index].genreId));
      assert.ok(catalog.genres[picks[index].genreId].some(artist => artist.track.spotifyUrl === picks[index].artist.track.spotifyUrl));
      const profile = rankPairGenres(host, guest, genres).find(item => item.genreId === picks[index].genreId);
      assert.equal(picks[index].hostCompatibility, profile.hostCompatibility);
      assert.equal(picks[index].guestCompatibility, profile.guestCompatibility);
    }
  }
});

test('identical listeners rotate without duplicates and empty or invalid slots stay unchanged', () => {
  let picks = recommendPairTracks(host, host, genres, catalog);
  for (let round = 0; round < 12; round++) {
    picks = rotatePairTrack(picks, round % 3, host, host, genres, catalog);
    assert.equal(new Set(picks.map(pick => pick.artist.track.spotifyUrl)).size, 3);
  }
  assert.equal(rotatePairTrack(picks, -1, host, host, genres, catalog), picks);
  assert.equal(rotatePairTrack(picks, 0, host, host, genres, { genres: {} }), picks);
});
