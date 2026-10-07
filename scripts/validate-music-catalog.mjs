import fs from 'node:fs';

const genres = JSON.parse(fs.readFileSync(new URL('../src/data/genres.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const exploration = JSON.parse(fs.readFileSync(new URL('../src/data/genreExplorerAlbums.json', import.meta.url), 'utf8'));
const spotifyAlbumPattern = /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/;
const spotifyTrackPattern = /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/;
const expectedRoles = new Set(['anchor', 'discovery']);
const errors = [];
const genreIds = new Set(genres.map(genre => genre.id));
const catalogIds = new Set(Object.keys(catalog.genres));
const albumUrls = new Set();
const trackUrls = new Set();

for (const genreId of genreIds) {
  const artists = catalog.genres[genreId];
  if (!artists) {
    errors.push(`${genreId}: catalog entry is missing`);
    continue;
  }
  if (artists.length < 2 || artists.length > 4) errors.push(`${genreId}: expected 2-4 artists, received ${artists.length}`);

  const roles = new Set(artists.map(artist => artist.role));
  for (const role of expectedRoles) if (!roles.has(role)) errors.push(`${genreId}: ${role} artist is missing`);
  if (artists.filter(artist => artist.role === 'anchor').length !== 1) errors.push(`${genreId}: exactly one representative anchor is required`);
  if (!artists.some(artist => artist.role === 'discovery' && artist.track?.year >= 2020)) errors.push(`${genreId}: a recent discovery release or recording is required`);

  for (const artist of artists) {
    const label = `${genreId}/${artist.name || 'unknown artist'}`;
    if (!artist.name || !artist.nameKo) errors.push(`${label}: bilingual artist name is required`);
    if (!expectedRoles.has(artist.role)) errors.push(`${label}: invalid curation role`);
    if (!artist.album?.title) errors.push(`${label}: album title is required`);
    if (!Number.isInteger(artist.album?.year) || artist.album.year < 1900 || artist.album.year > 2100) errors.push(`${label}: invalid release year`);
    if (!spotifyAlbumPattern.test(artist.album?.spotifyUrl || '')) errors.push(`${label}: invalid Spotify album URL`);
    if (albumUrls.has(artist.album?.spotifyUrl)) errors.push(`${label}: duplicate Spotify album URL`);
    albumUrls.add(artist.album?.spotifyUrl);
    if (!artist.track?.title?.trim()) errors.push(`${label}: track title is required`);
    if (!Number.isInteger(artist.track?.year) || artist.track.year < 1900 || artist.track.year > 2100) errors.push(`${label}: invalid track year`);
    if (!spotifyTrackPattern.test(artist.track?.spotifyUrl || '')) errors.push(`${label}: invalid Spotify track URL`);
    if (trackUrls.has(artist.track?.spotifyUrl)) errors.push(`${label}: duplicate Spotify track URL`);
    trackUrls.add(artist.track?.spotifyUrl);
  }
}

for (const genreId of catalogIds) if (!genreIds.has(genreId)) errors.push(`${genreId}: catalog references an unknown genre`);

for (const artist of catalog.crossovers || []) {
  const label = `crossover/${artist.name || 'unknown artist'}`;
  if (artist.role !== 'bridge') errors.push(`${label}: crossover role must be bridge`);
  if (!artist.name || !artist.nameKo) errors.push(`${label}: bilingual artist name is required`);
  if (!['jpop', 'kpop', 'global'].includes(artist.scene)) errors.push(`${label}: unknown scene`);
  if (!Array.isArray(artist.genreIds) || artist.genreIds.length === 0) errors.push(`${label}: at least one matching genre is required`);
  else for (const genreId of artist.genreIds) if (!genreIds.has(genreId)) errors.push(`${label}: unknown genre ${genreId}`);
  if (!artist.album?.title || !spotifyAlbumPattern.test(artist.album.spotifyUrl || '')) errors.push(`${label}: invalid Spotify album`);
  if (!artist.track?.title || !spotifyTrackPattern.test(artist.track.spotifyUrl || '')) errors.push(`${label}: invalid Spotify track`);
  if (!Number.isInteger(artist.album?.year) || artist.album.year < 1900 || artist.album.year > 2100) errors.push(`${label}: invalid album year`);
  if (!Number.isInteger(artist.track?.year) || artist.track.year < 1900 || artist.track.year > 2100) errors.push(`${label}: invalid track year`);
  if (albumUrls.has(artist.album?.spotifyUrl)) errors.push(`${label}: duplicate Spotify album URL`);
  if (trackUrls.has(artist.track?.spotifyUrl)) errors.push(`${label}: duplicate Spotify track URL`);
  albumUrls.add(artist.album?.spotifyUrl);
  trackUrls.add(artist.track?.spotifyUrl);
}

for (const id of Object.keys(exploration.genres)) if (!genreIds.has(id)) errors.push(`${id}: unknown exploration genre`);
let explorationCount = 0;
for (const genreId of genreIds) {
  const extras = exploration.genres[genreId] || [];
  explorationCount += extras.length;
  const combined = [...(catalog.genres[genreId] || []), ...(catalog.crossovers || []).filter(artist => artist.genreIds.includes(genreId)), ...extras];
  if (combined.length !== 6) errors.push(`${genreId}: exploration requires exactly six album gateways, received ${combined.length}`);
  if (new Set(combined.map(artist => artist.name.normalize('NFKC').trim().toLowerCase())).size !== combined.length) errors.push(`${genreId}: duplicate exploration artist`);
  if (new Set(combined.map(artist => artist.album.spotifyUrl)).size !== combined.length) errors.push(`${genreId}: duplicate exploration album`);
  for (const artist of extras) {
    const label = `exploration/${genreId}/${artist.name}`;
    if (!artist.name?.trim() || !artist.nameKo?.trim()) errors.push(`${label}: bilingual artist names required`);
    if (artist.role !== 'discovery') errors.push(`${label}: supplementary album must not replace a cornerstone`);
    if (!artist.album?.title?.trim() || !spotifyAlbumPattern.test(artist.album?.spotifyUrl || '')) errors.push(`${label}: invalid Spotify album`);
    if (!Number.isInteger(artist.album?.year) || artist.album.year < 1900 || artist.album.year > 2100) errors.push(`${label}: invalid album year`);
  }
}

if (errors.length > 0) {
  console.error(`Music catalog validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Music catalog valid: ${genreIds.size} genres, ${albumUrls.size} curated Spotify albums and ${trackUrls.size} tracks, reviewed ${catalog.reviewedAt}.`);
console.log(`Exploration valid: six album gateways in each of ${genreIds.size} genres, ${explorationCount} supplemental Spotify albums, reviewed ${exploration.reviewedAt}.`);
