// Public embed metadata is for editorial checks only, never the runtime app.
export function normalizeMusicLabel(label) {
  return String(label || '').normalize('NFKD').toLowerCase()
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1').normalize('NFKC')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function compareSpotifyMetadata(artist, entity) {
  const expectedId = artist.track?.spotifyUrl?.split('/').at(-1);
  const track = (entity.trackList || []).find(item => item.uri?.split(':').at(-1) === expectedId);
  const artistNames = [
    ...String(artist.name || '').split(/\s+&\s+/),
    ...String(artist.album?.credit || '').split(/\s*·\s*/),
  ].map(normalizeMusicLabel).filter(Boolean);
  const credits = normalizeMusicLabel(`${entity.subtitle || ''} ${track?.subtitle || ''}`);
  return {
    trackFound: expectedId ? Boolean(track) : null,
    albumTitleMatches: normalizeMusicLabel(artist.album.title) === normalizeMusicLabel(entity.title || entity.name),
    trackTitleMatches: track ? normalizeMusicLabel(artist.track.title) === normalizeMusicLabel(track.title) : null,
    artistMatches: artistNames.length > 0 && artistNames.every(name => credits.includes(name)),
    actualAlbum: entity.title || entity.name,
    actualTrack: track?.title,
    actualCredits: track?.subtitle || entity.subtitle,
  };
}
