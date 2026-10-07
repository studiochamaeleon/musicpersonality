import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSpotifyMetadata, normalizeMusicLabel } from '../../scripts/lib/spotify-metadata.mjs';

const artist = { name: 'Tom Misch & Yussef Dayes', album: { title: 'What Kinda Music' }, track: { title: 'Nightrider', spotifyUrl: 'https://open.spotify.com/track/123' } };
const entity = { title: 'What Kinda Music', subtitle: 'Tom Misch', trackList: [{ uri: 'spotify:track:123', title: 'Nightrider', subtitle: 'Tom Misch, Yussef Dayes, Freddie Gibbs' }] };

test('metadata audit checks song title, album title and every credited collaborator', () => {
  const checked = compareSpotifyMetadata(artist, entity);
  assert.equal(checked.trackFound, true);
  assert.equal(checked.trackTitleMatches, true);
  assert.equal(checked.albumTitleMatches, true);
  assert.equal(checked.artistMatches, true);
  assert.equal(compareSpotifyMetadata(artist, { ...entity, trackList: [{ ...entity.trackList[0], subtitle: 'Tom Misch' }] }).artistMatches, false);
});

test('same track ID alone does not hide wrong album or song labels', () => {
  assert.equal(compareSpotifyMetadata({ ...artist, album: { title: 'Geography' } }, entity).albumTitleMatches, false);
  assert.equal(compareSpotifyMetadata({ ...artist, track: { ...artist.track, title: 'Festival' } }, entity).trackTitleMatches, false);
  assert.equal(compareSpotifyMetadata({ ...artist, track: { ...artist.track, spotifyUrl: 'https://open.spotify.com/track/missing' } }, entity).trackFound, false);
});

test('classical composer names do not conceal a wrong displayed performance credit', () => {
  const recording = { name: 'Johann Sebastian Bach', album: { title: 'Goldberg Variations', credit: 'Víkingur Ólafsson' }, track: { title: 'Aria', spotifyUrl: 'https://open.spotify.com/track/bach' } };
  const metadata = { title: 'Goldberg Variations', subtitle: 'Johann Sebastian Bach', trackList: [{ uri: 'spotify:track:bach', title: 'Aria', subtitle: 'Johann Sebastian Bach, Vikingur Olafsson' }] };
  assert.equal(compareSpotifyMetadata(recording, metadata).artistMatches, true);
  assert.equal(compareSpotifyMetadata({ ...recording, album: { ...recording.album, credit: 'Glenn Gould' } }, metadata).artistMatches, false);
});

test('music labels normalize diacritics, punctuation and full-width names without dropping non-Latin names', () => {
  assert.equal(normalizeMusicLabel('Víkingur Ólafsson'), normalizeMusicLabel('Vikingur Olafsson'));
  assert.equal(normalizeMusicLabel('Run–D.M.C.'), normalizeMusicLabel('RUN DMC'));
  assert.equal(normalizeMusicLabel('ａｅｓｐａ'), 'aespa');
  assert.equal(normalizeMusicLabel('アイドル'), 'アイドル');
  assert.notEqual(normalizeMusicLabel('アイドル'), normalizeMusicLabel('アイトル'));
});
