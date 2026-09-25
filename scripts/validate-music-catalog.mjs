import fs from 'node:fs';

const genres = JSON.parse(fs.readFileSync(new URL('../src/data/genres.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/musicCatalog.json', import.meta.url), 'utf8'));
const spotifyAlbumPattern = /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/;
const expectedRoles = new Set(['anchor', 'discovery']);
const errors = [];
const genreIds = new Set(genres.map(genre => genre.id));
const catalogIds = new Set(Object.keys(catalog.genres));
const albumUrls = new Set();

for (const genreId of genreIds) {
  const artists = catalog.genres[genreId];
  if (!artists) {
    errors.push(`${genreId}: catalog entry is missing`);
    continue;
  }
  if (artists.length < 2 || artists.length > 4) errors.push(`${genreId}: expected 2-4 artists, received ${artists.length}`);

  const roles = new Set(artists.map(artist => artist.role));
  for (const role of expectedRoles) if (!roles.has(role)) errors.push(`${genreId}: ${role} artist is missing`);

  for (const artist of artists) {
    const label = `${genreId}/${artist.name || 'unknown artist'}`;
    if (!artist.name || !artist.nameKo) errors.push(`${label}: bilingual artist name is required`);
    if (!expectedRoles.has(artist.role)) errors.push(`${label}: invalid curation role`);
    if (!artist.album?.title) errors.push(`${label}: album title is required`);
    if (!Number.isInteger(artist.album?.year) || artist.album.year < 1900 || artist.album.year > 2100) errors.push(`${label}: invalid release year`);
    if (!spotifyAlbumPattern.test(artist.album?.spotifyUrl || '')) errors.push(`${label}: invalid Spotify album URL`);
    if (albumUrls.has(artist.album?.spotifyUrl)) errors.push(`${label}: duplicate Spotify album URL`);
    albumUrls.add(artist.album?.spotifyUrl);
  }
}

for (const genreId of catalogIds) if (!genreIds.has(genreId)) errors.push(`${genreId}: catalog references an unknown genre`);

if (errors.length > 0) {
  console.error(`Music catalog validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Music catalog valid: ${genreIds.size} genres, ${albumUrls.size} curated Spotify albums, reviewed ${catalog.reviewedAt}.`);
