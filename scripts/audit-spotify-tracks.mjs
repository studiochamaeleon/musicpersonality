import { readFileSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import { compareSpotifyMetadata } from './lib/spotify-metadata.mjs';

const catalog = JSON.parse(readFileSync(new URL('../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const catalogEntries = Object.entries(catalog.genres).flatMap(([genreId, artists]) =>
  artists.map(artist => ({ genreId, artist })),
).concat((catalog.crossovers || []).map(artist => ({ genreId: `crossover/${artist.scene}`, artist })));
const extraAlbumIds = process.argv.find(arg => arg.startsWith('--album-ids='))?.slice('--album-ids='.length).split(',');
const entries = extraAlbumIds?.length ? extraAlbumIds.map(id => ({
  genreId: id,
  artist: { name: id, role: 'discovery', album: { title: id, spotifyUrl: `https://open.spotify.com/album/${id}` } },
})) : catalogEntries;

async function fetchAlbumHtml(albumId, label) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`https://open.spotify.com/embed/album/${albumId}`, { signal: AbortSignal.timeout(25000) });
      if (response.ok) return await response.text();
      if (![429, 502, 503, 504].includes(response.status) || attempt === 2) throw new Error(`${response.status} ${label}`);
      console.error(`Transient ${response.status}: retrying ${label} (${attempt + 1}/2)`);
    } catch (error) {
      if (attempt === 2 || !(error instanceof TypeError || ['TimeoutError', 'AbortError'].includes(error.name))) throw error;
      console.error(`Network timeout/error: retrying ${label} (${attempt + 1}/2)`);
    }
    await wait(1000 * (attempt + 1));
  }
  throw new Error(`No response: ${label}`);
}

async function loadTracks({ genreId, artist }) {
  const albumId = artist.album.spotifyUrl.split('/').at(-1);
  const html = await fetchAlbumHtml(albumId, `${genreId}/${artist.name}`);
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (!match) throw new Error(`No track data: ${genreId}/${artist.name}`);
  const entity = JSON.parse(match[1]).props.pageProps.state.data.entity;
  const expectedTrackId = artist.track?.spotifyUrl.split('/').at(-1);
  const metadata = compareSpotifyMetadata(artist, entity);
  const albumTracks = entity.trackList.map(track => ({
    title: track.title,
    id: track.uri.split(':').at(-1),
    playable: track.isPlayable,
  }));
  return {
    genreId,
    role: artist.role,
    artist: artist.name,
    album: artist.album.title,
    expectedTrack: artist.track?.title,
    expectedTrackId,
    ...metadata,
    tracks: albumTracks,
  };
}

const results = [];
let fetchFailures = 0;
for (let index = 0; index < entries.length; index += 6) {
  const batch = await Promise.allSettled(entries.slice(index, index + 6).map(loadTracks));
  for (const result of batch) {
    if (result.status === 'fulfilled') results.push(result.value);
    else {
      fetchFailures += 1;
      console.error(result.reason);
    }
  }
  console.error(`Checked ${Math.min(index + 6, entries.length)}/${entries.length} albums`);
}

const missingTracks = results.filter(result => result.trackFound === false);
const metadataMismatches = results.filter(result => result.trackFound !== null
  && (!result.albumTitleMatches || !result.trackTitleMatches || !result.artistMatches));
for (const result of missingTracks) console.error(`Track not on album: ${result.genreId}/${result.artist} — ${result.expectedTrack} (${result.expectedTrackId})`);
for (const result of metadataMismatches) console.error(`Metadata mismatch: ${result.genreId}/${result.artist} — ${JSON.stringify({ album: result.actualAlbum, track: result.actualTrack, credits: result.actualCredits })}`);
console.error(`Album-track audit: ${results.length}/${entries.length} fetched, ${missingTracks.length} track mismatches, ${metadataMismatches.length} metadata mismatches, ${fetchFailures} fetch failures.`);
if (missingTracks.length || metadataMismatches.length || fetchFailures) process.exitCode = 1;

if (process.argv.includes('--mismatches')) {
  console.log(JSON.stringify([...new Set([...missingTracks, ...metadataMismatches])].map(result => ({
    genreId: result.genreId,
    artist: result.artist,
    expectedTrack: result.expectedTrack,
    expectedTrackId: result.expectedTrackId,
    actualAlbum: result.actualAlbum,
    actualTrack: result.actualTrack,
    actualCredits: result.actualCredits,
    albumTracks: result.tracks.filter(track => track.title.toLocaleLowerCase().includes(result.expectedTrack.toLocaleLowerCase()) || result.expectedTrack.toLocaleLowerCase().includes(track.title.toLocaleLowerCase())),
  })), null, 2));
} else if (process.argv.includes('--compact')) {
  console.log(JSON.stringify(results.map(result => ({
    ...result,
    tracks: result.tracks.filter(track => track.playable).slice(0, 10),
  }))));
} else {
  console.log(JSON.stringify(results, null, 2));
}
