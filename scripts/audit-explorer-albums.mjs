// Editorial-only check of public Spotify embed pages. No runtime API or credentials.
import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import { normalizeMusicLabel } from './lib/spotify-metadata.mjs';

const catalog = JSON.parse(readFileSync(new URL('../src/data/genreExplorerAlbums.json', import.meta.url), 'utf8'));
const entries = Object.entries(catalog.genres).flatMap(([genreId, artists]) => artists.map(artist => ({ genreId, artist })));
async function check({ genreId, artist }) {
  const id = artist.album.spotifyUrl.split('/').at(-1);
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`https://open.spotify.com/embed/album/${id}`, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const data = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (!data) throw new Error('Missing album metadata');
      const entity = JSON.parse(data[1]).props.pageProps.state.data.entity;
      const credits = [entity.subtitle, ...(entity.trackList || []).map(track => track.subtitle)].filter(Boolean).join(' · ');
      const names = [artist.name, ...(artist.album.credit || '').split(/\s*[,·]\s*/)].filter(Boolean);
      return {
        genreId, artist: artist.name, url: artist.album.spotifyUrl,
        expectedAlbum: artist.album.title, actualAlbum: entity.title || entity.name,
        albumMatches: normalizeMusicLabel(artist.album.title) === normalizeMusicLabel(entity.title || entity.name),
        artistMatches: names.flatMap(name => name.split(/\s+&\s+/)).every(name => normalizeMusicLabel(credits).includes(normalizeMusicLabel(name))),
        actualCredits: entity.subtitle, releaseDate: entity.releaseDate,
        playableTracks: (entity.trackList || []).filter(track => track.isPlayable).length,
        trackCount: (entity.trackList || []).length,
        previewRestrictions: [...new Set((entity.trackList || []).filter(track => !track.isPlayable).map(track => track.playabilityReason))],
      };
    } catch (caught) {
      error = caught;
      if (attempt < 2) await wait(1000 * (attempt + 1));
    }
  }
  return { genreId, artist: artist.name, url: artist.album.spotifyUrl, error: String(error) };
}
const results = [];
for (let i = 0; i < entries.length; i += 6) {
  results.push(...await Promise.all(entries.slice(i, i + 6).map(check)));
  console.log(`Checked ${Math.min(i + 6, entries.length)}/${entries.length} exploration albums`);
}
// AGE_UNKNOWN is an unauthenticated preview restriction, not a broken album.
const failures = results.filter(result => result.error || !result.albumMatches || !result.artistMatches || !result.trackCount
  || (!result.playableTracks && result.previewRestrictions.some(reason => reason !== 'AGE_UNKNOWN')));
for (const failure of failures) console.error(JSON.stringify(failure));
const report = { checkedAt: new Date().toISOString(), checked: results.length, failures: failures.length, results };
const output = process.argv.find(arg => arg.startsWith('--report='))?.slice('--report='.length);
if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`Exploration album audit: ${results.length} checked, ${failures.length} failures.`);
if (failures.length) process.exitCode = 1;
