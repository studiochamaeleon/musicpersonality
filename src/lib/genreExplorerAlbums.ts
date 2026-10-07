import type { GenreExplorerArtist, GenreExplorerAlbumCatalog, MusicCatalog } from '../types/index.ts';
import { artistSearchFields, matchesGenreSearch, normalizeGenreSearch } from './genreSearch.ts';

export const GENRE_EXPLORER_ALBUM_LIMIT = 6;

/** Preserve the cornerstone, include search matches, then fill six distinct album gateways. */
export function selectGenreExplorerAlbums(
  genreId: string,
  catalog: MusicCatalog,
  exploration: GenreExplorerAlbumCatalog,
  searchTerm = '',
  preferJpop = false,
): GenreExplorerArtist[] {
  const bridges = (catalog.crossovers || []).filter(artist => artist.genreIds.includes(genreId));
  const jpopNames = new Set(bridges.filter(artist => artist.scene === 'jpop').map(artist => artist.name));
  const candidates = [
    ...(catalog.genres[genreId] || []),
    ...bridges,
    ...(exploration.genres[genreId] || []),
  ];
  const rank = (artist: GenreExplorerArtist) => {
    if (artist.role === 'anchor') return 3;
    if (searchTerm.trim() && matchesGenreSearch(artistSearchFields(artist), searchTerm)) return 2;
    if (preferJpop && jpopNames.has(artist.name)) return 1;
    return 0;
  };
  const names = new Set<string>();
  const albums = new Set<string>();
  return candidates.sort((a, b) => rank(b) - rank(a)).filter(artist => {
    const name = normalizeGenreSearch(artist.name);
    if (!name || names.has(name) || albums.has(artist.album.spotifyUrl)) return false;
    names.add(name);
    albums.add(artist.album.spotifyUrl);
    return true;
  }).slice(0, GENRE_EXPLORER_ALBUM_LIMIT);
}
