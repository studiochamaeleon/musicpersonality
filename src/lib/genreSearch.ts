import type { GenreExplorerArtist, GenreSchema, MusicCatalog } from '../types/index.ts';
import { getArtistName, getGenreCharacteristics, getGenreDescription, getGenreName } from './genreTranslations.ts';

const SEARCH_LANGUAGES = ['ko', 'en', 'ja'] as const;

// One index for all UI languages: familiar original names remain searchable after a language change.
export function normalizeGenreSearch(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}

export function artistSearchFields(artist: GenreExplorerArtist): string[] {
  return [...new Set([
    artist.name,
    artist.nameKo || '',
    ...SEARCH_LANGUAGES.map(language => getArtistName(artist, language)),
    artist.album.title,
    artist.album.credit || '',
    artist.track?.title || '',
  ].map(normalizeGenreSearch).filter(Boolean))];
}

export function buildGenreSearchIndex(genres: GenreSchema[], catalog: MusicCatalog, exploration: Record<string, GenreExplorerArtist[]> = {}): Map<string, string[]> {
  return new Map(genres.map(genre => {
    const crossovers = (catalog.crossovers || []).filter(artist => artist.genreIds.includes(genre.id));
    const artists = [...(catalog.genres[genre.id] || []), ...crossovers, ...(exploration[genre.id] || [])];
    const fields = [
      genre.name,
      genre.nameKo,
      genre.category,
      ...SEARCH_LANGUAGES.flatMap(language => [
        getGenreName(genre, language),
        getGenreDescription(genre.id, genre.description, language),
        ...getGenreCharacteristics(genre.id, genre.characteristics, language),
      ]),
      ...artists.flatMap(artistSearchFields),
      ...crossovers.map(artist => artist.scene),
    ];
    return [genre.id, [...new Set(fields.map(normalizeGenreSearch).filter(Boolean))]];
  }));
}

export function matchesGenreSearch(fields: readonly string[], searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;
  const query = normalizeGenreSearch(searchTerm);
  // Punctuation-only input is not an empty query and should not accidentally match every genre.
  return Boolean(query) && fields.some(field => field.includes(query));
}
