import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { artistRecommendationAlternatives, planArtistRecommendations, rotateArtistRecommendation } from '../../src/lib/artistRecommendations.ts';
import { rankResultGenres } from '../../src/lib/resultRanking.ts';

const catalog = JSON.parse(readFileSync(new URL('../../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const genres = JSON.parse(readFileSync(new URL('../../src/data/genres.json', import.meta.url), 'utf8'));
const format = candidate => ({
  artist: candidate.artist, genreId: candidate.genreId, compatibility: candidate.compatibility,
  genreName: candidate.genreId, genreNameKo: candidate.genreId, reason: candidate.artist.role,
});
const display = slots => slots.map(slot => ({ ...format(slot), alternatives: slot.alternatives.map(format) }));
const artist = (name, id, role = 'discovery', year = 2024) => ({
  name, role, track: { title: name + ' track', year, spotifyUrl: 'https://open.spotify.com/track/' + id.padStart(22, '0') },
  album: { title: name + ' album', year, spotifyUrl: 'https://open.spotify.com/album/' + id.padStart(22, '0') },
});
function assertUnique(picks) {
  assert.equal(new Set(picks.map(pick => pick.artist.track.spotifyUrl)).size, picks.length);
  assert.equal(new Set(picks.map(pick => pick.artist.name.normalize('NFKC').trim().toLowerCase())).size, picks.length);
}

test('personal picks keep one cornerstone, one discovery per nearby genre, and one optional bridge', () => {
  const rankings = ['first', 'second', 'third', 'fourth'].map((genreId, index) => ({ genreId, compatibility: 95 - index }));
  const fixture = { genres: Object.fromEntries(rankings.map((rank, index) => [rank.genreId, [
    artist('Anchor ' + index, 'a' + index, 'anchor', 1970),
    artist('Old discovery ' + index, 'b' + index, 'discovery', 1998),
    artist('Recent discovery ' + index, 'c' + index),
    artist('Another discovery ' + index, 'd' + index),
  ]])), crossovers: [{ ...artist('Bridge', 'bridge', 'bridge'), genreIds: ['first'], scene: 'global' }] };
  const slots = planArtistRecommendations(rankings, fixture);
  assert.equal(slots.length, 5);
  assert.deepEqual(slots.map(slot => slot.artist.role), ['anchor', 'discovery', 'discovery', 'discovery', 'bridge']);
  assert.equal(slots[0].artist.name, 'Anchor 0');
  assert.equal(slots[0].alternatives.length, 0);
  assert.equal(slots[1].artist.name, 'Recent discovery 0');
  assert.equal(slots[1].alternatives.length, 3);
  assert.ok(slots.every(slot => slot.genreId !== 'fourth'));
  assert.deepEqual(planArtistRecommendations(rankings, fixture), slots, 're-entry must not randomize base picks');
  for (const limit of [0, 1, 2, 4, 6, 20]) assert.ok(planArtistRecommendations(rankings, fixture, limit).length <= Math.min(limit, 6));
});

test('each catalog artist is reachable without dumping added discoveries into the initial result', () => {
  for (const genre of genres) {
    const slots = planArtistRecommendations([{ genreId: genre.id, compatibility: 100 }], catalog);
    const seen = new Set(slots.map(slot => slot.artist.name));
    let picks = display(slots);
    const discoveryIndex = picks.findIndex(pick => pick.artist.role === 'discovery');
    for (let round = 0; round < catalog.genres[genre.id].length; round++) {
      picks = rotateArtistRecommendation(picks, discoveryIndex);
      picks.forEach(pick => seen.add(pick.artist.name));
      assertUnique(picks);
    }
    for (const entry of catalog.genres[genre.id]) assert.ok(seen.has(entry.name), genre.id + ': unreachable ' + entry.name);
    assert.equal(slots.filter(slot => slot.artist.role === 'discovery').length, 1);
    const recent = catalog.genres[genre.id].filter(entry => entry.role === 'discovery' && entry.track.year >= 2020);
    assert.ok(recent.length, genre.id + ': recent discovery must exist for every genre');
    assert.ok(slots[discoveryIndex].artist.track.year >= 2020, genre.id + ': recent discovery not offered');
  }
});

test('all matching crossover artists including later catalog entries can be selected', () => {
  for (const genre of genres) {
    const expected = (catalog.crossovers || []).filter(entry => entry.genreIds.includes(genre.id));
    if (!expected.length) continue;
    let picks = display(planArtistRecommendations([{ genreId: genre.id, compatibility: 87 }], catalog));
    const index = picks.findIndex(pick => pick.artist.role === 'bridge');
    assert.ok(index >= 0, genre.id + ': bridge slot missing');
    const seen = new Set([picks[index].artist.name]);
    for (let round = 0; round < expected.length; round++) {
      picks = rotateArtistRecommendation(picks, index);
      seen.add(picks[index].artist.name);
      assertUnique(picks);
      assert.equal(picks[index].compatibility, 87);
      assert.equal(picks[index].genreId, genre.id);
    }
    for (const entry of expected) assert.ok(seen.has(entry.name), genre.id + ': shadowed ' + entry.name);
  }
});

test('rotation retains nearby genre similarity and never duplicates artists or tracks', () => {
  for (const genre of genres) {
    const rankings = rankResultGenres(genre.personalityProfile, genres).map(({ genre, match }) => ({ genreId: genre.id, compatibility: match.compatibility }));
    let picks = display(planArtistRecommendations(rankings, catalog));
    const base = picks;
    assert.equal(picks[0].genreId, genre.id, 'its own profile keeps the corresponding genre cornerstone');
    assert.ok(picks.filter(pick => pick.artist.role === 'discovery').every(pick => pick.artist.track.year >= 2020), genre.id + ': actual top-three result should expose modern discoveries');
    const anchor = picks.find(pick => pick.artist.role === 'anchor');
    for (let round = 0; round < 30; round++) {
      picks = rotateArtistRecommendation(picks, round % picks.length);
      assertUnique(picks);
      assert.ok(picks.length <= 6);
      assert.equal(picks.find(pick => pick.artist.role === 'anchor'), anchor);
      for (const pick of picks) {
        const rank = rankings.slice(0, 3).find(rank => rank.genreId === pick.genreId);
        assert.ok(rank);
        assert.equal(pick.compatibility, rank.compatibility);
      }
    }
    assert.deepEqual(display(planArtistRecommendations(rankings, catalog)), base, 'explicit alternatives must not alter the base plan');
  }
});

test('conflicting alternatives do not create a dead-end or replace another visible artist', () => {
  const a = format({ artist: artist('A', 'a'), genreId: 'one', compatibility: 90 });
  const b = format({ artist: artist('B', 'b'), genreId: 'one', compatibility: 90 });
  const c = format({ artist: artist('C', 'c'), genreId: 'one', compatibility: 90 });
  const duplicateName = format({ artist: artist(' B ', 'another'), genreId: 'one', compatibility: 90 });
  const duplicateTrack = format({ artist: artist('Another name', 'b'), genreId: 'one', compatibility: 90 });
  let picks = [{ ...a, alternatives: [a, b, duplicateName, duplicateTrack, c] }, b];
  assert.deepEqual(artistRecommendationAlternatives(picks, 0).map(pick => pick.artist.name), ['A', 'C']);
  for (let round = 0; round < 4; round++) {
    const previous = picks[0].artist.name;
    picks = rotateArtistRecommendation(picks, 0);
    assert.notEqual(picks[0].artist.name, previous);
    assertUnique(picks);
    assert.equal(picks[1], b);
  }
});

test('missing or malformed catalog entries and invalid rotation indices stay safe', () => {
  assert.deepEqual(planArtistRecommendations([{ genreId: 'missing', compatibility: 80 }], { genres: {} }), []);
  const entry = artist('Valid', 'valid', 'anchor');
  const fixture = { genres: { known: [{ ...entry, name: '' }, { ...entry, track: { ...entry.track, spotifyUrl: 'https://bad.example/' } }, entry] } };
  const picks = display(planArtistRecommendations([{ genreId: 'known', compatibility: 80 }, { genreId: 'known', compatibility: 80 }], fixture));
  assert.equal(picks.length, 1);
  for (const index of [-1, 0, 100]) assert.equal(rotateArtistRecommendation(picks, index), picks);
  assert.deepEqual(artistRecommendationAlternatives(picks, -1), []);
});
