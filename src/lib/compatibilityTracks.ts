import type { ArtistReference, GenreSchema, MUSICPersonality, MusicCatalog } from '../types/index.ts';
import { genreMatch } from './genreScore.ts';
import { rankResultGenres } from './resultRanking.ts';
import { CURRENT_RESULT_VERSION, type ResultVersion } from './resultVersion.ts';

export interface PairGenreRecommendation {
  genreId: string;
  compatibility: number;
  hostCompatibility: number;
  guestCompatibility: number;
}

export interface PairTrackPick extends PairGenreRecommendation {
  artist: ArtistReference;
  role: 'shared' | 'host' | 'guest';
}

// The weaker match leads so a close match for one listener cannot conceal a
// large mismatch for the other. These compare genre profiles, not song ratings.
export function rankPairGenres(host: MUSICPersonality, guest: MUSICPersonality, genres: GenreSchema[]): PairGenreRecommendation[] {
  return genres.map(genre => {
    const hostMatch = genreMatch(host, genre.personalityProfile);
    const guestMatch = genreMatch(guest, genre.personalityProfile);
    return {
      genreId: genre.id,
      compatibility: Math.min(hostMatch.compatibility, guestMatch.compatibility),
      hostCompatibility: hostMatch.compatibility,
      guestCompatibility: guestMatch.compatibility,
      weakerSimilarity: Math.min(hostMatch.similarity, guestMatch.similarity),
      meanSimilarity: (hostMatch.similarity + guestMatch.similarity) / 2,
    };
  }).sort((a, b) => b.weakerSimilarity - a.weakerSimilarity || b.meanSimilarity - a.meanSimilarity || a.genreId.localeCompare(b.genreId))
    .map(({ genreId, compatibility, hostCompatibility, guestCompatibility }) => ({ genreId, compatibility, hostCompatibility, guestCompatibility }));
}

/** A shared starting point, then a distinct track each listener can introduce. */
export function recommendPairTracks(
  host: MUSICPersonality,
  guest: MUSICPersonality,
  genres: GenreSchema[],
  catalog: MusicCatalog,
  hostVersion: ResultVersion = CURRENT_RESULT_VERSION,
  guestVersion: ResultVersion = CURRENT_RESULT_VERSION,
): PairTrackPick[] {
  const shared = rankPairGenres(host, guest, genres);
  const profiles = new Map(shared.map(item => [item.genreId, item]));
  const picks: PairTrackPick[] = [];
  const seen = new Set<string>();
  const choose = (genreIds: string[], role: PairTrackPick['role'], preferred: 'anchor' | 'discovery') => {
    for (const genreId of genreIds) {
      const artists = catalog.genres[genreId] || [];
      const artist = [...artists.filter(item => item.role === preferred), ...artists.filter(item => item.role !== preferred)]
        .find(item => !seen.has(item.track.spotifyUrl));
      const profile = profiles.get(genreId);
      if (!artist || !profile) continue;
      seen.add(artist.track.spotifyUrl);
      picks.push({ ...profile, artist, role });
      return;
    }
  };
  choose(shared.map(item => item.genreId), 'shared', 'anchor');
  choose(rankResultGenres(host, genres, hostVersion).map(item => item.genre.id), 'host', 'discovery');
  choose(rankResultGenres(guest, genres, guestVersion).map(item => item.genre.id), 'guest', 'discovery');
  return picks;
}

/** Rotate within the closest three curated genres, never duplicate another slot. */
export function pairTrackAlternatives(
  picks: PairTrackPick[], index: number, host: MUSICPersonality, guest: MUSICPersonality,
  genres: GenreSchema[], catalog: MusicCatalog, hostVersion: ResultVersion = CURRENT_RESULT_VERSION, guestVersion: ResultVersion = CURRENT_RESULT_VERSION,
): PairTrackPick[] {
  const current = picks[index];
  if (!current) return [];
  const ranked = rankPairGenres(host, guest, genres);
  const profiles = new Map(ranked.map(item => [item.genreId, item]));
  const genreIds = current.role === 'shared' ? ranked.slice(0, 3).map(item => item.genreId)
    : rankResultGenres(current.role === 'host' ? host : guest, genres, current.role === 'host' ? hostVersion : guestVersion).slice(0, 3).map(item => item.genre.id);
  const seen = new Set(picks.filter((_, slot) => slot !== index).map(pick => pick.artist.track.spotifyUrl));
  const preferred = current.role === 'shared' ? 'anchor' : 'discovery';
  return [...new Set([...genreIds, current.genreId])].flatMap(genreId => {
    const profile = profiles.get(genreId);
    if (!profile) return [];
    const artists = catalog.genres[genreId] ?? [];
    return [...artists.filter(artist => artist.role === preferred), ...artists.filter(artist => artist.role !== preferred)].flatMap(artist => {
      if (seen.has(artist.track.spotifyUrl)) return [];
      seen.add(artist.track.spotifyUrl);
      return [{ ...profile, artist, role: current.role }];
    });
  });
}

export function rotatePairTrack(
  picks: PairTrackPick[], index: number, host: MUSICPersonality, guest: MUSICPersonality,
  genres: GenreSchema[], catalog: MusicCatalog, hostVersion: ResultVersion = CURRENT_RESULT_VERSION, guestVersion: ResultVersion = CURRENT_RESULT_VERSION,
): PairTrackPick[] {
  const candidates = pairTrackAlternatives(picks, index, host, guest, genres, catalog, hostVersion, guestVersion);
  if (!picks[index] || candidates.length < 2) return picks;
  const current = candidates.findIndex(pick => pick.artist.track.spotifyUrl === picks[index].artist.track.spotifyUrl);
  const next = candidates[(current + 1) % candidates.length];
  return picks.map((pick, slot) => slot === index ? next : pick);
}
