import { MUSIC_SCORE_KEYS, rankGenres, type MusicScoreProfile } from './genreScore.ts';
import { CURRENT_RESULT_VERSION, type ResultVersion } from './resultVersion.ts';

// This is the catalogue that was live when v2 result links were first shared.
// Keep the set and the matching formula frozen so existing cards retain their type and score.
const LEGACY_GENRE_IDS = new Set([
  'jazz_cool', 'jazz_bebop', 'rock_alternative', 'rock_indie',
  'electronic_ambient', 'electronic_house', 'classical_baroque', 'classical_minimalism',
  'pop_indie', 'pop_dream', 'rock_classic', 'electronic_techno',
  'jazz_fusion', 'classical_romantic', 'pop_kpop', 'jazz_smooth',
  'rock_progressive', 'electronic_chillout', 'pop_mainstream', 'classical_contemporary',
  'hiphop_oldschool', 'hiphop_trap', 'rnb_classic', 'rnb_neosoul',
  'world_latin', 'world_traditional', 'rock_metal', 'rock_punk',
  'electronic_dnb', 'electronic_dubstep', 'pop_synthpop', 'pop_folk',
]);

export function isLegacyGenre(id: string) {
  return LEGACY_GENRE_IDS.has(id);
}

export function rankResultGenres<T extends { id: string; personalityProfile: MusicScoreProfile }>(
  user: MusicScoreProfile,
  genres: T[],
  version: ResultVersion = CURRENT_RESULT_VERSION,
) {
  if (version === CURRENT_RESULT_VERSION) return rankGenres(user, genres);

  return genres.filter(genre => isLegacyGenre(genre.id)).map(genre => {
    const userVector = MUSIC_SCORE_KEYS.map(key => user[key]);
    const genreVector = MUSIC_SCORE_KEYS.map(key => genre.personalityProfile[key]);
    const dot = userVector.reduce((sum, value, index) => sum + value * genreVector[index], 0);
    const userMagnitude = Math.hypot(...userVector);
    const genreMagnitude = Math.hypot(...genreVector);
    const cosine = userMagnitude === 0 && genreMagnitude === 0
      ? 1
      : userMagnitude === 0 || genreMagnitude === 0
        ? 0
        : Math.min(1, Math.max(0, dot / (userMagnitude * genreMagnitude)));
    const distance = Math.hypot(...MUSIC_SCORE_KEYS.map(key => user[key] - genre.personalityProfile[key])) / Math.sqrt(5);
    const euclidean = Math.max(0, 1 - distance / 100);
    const similarity = cosine * 0.6 + euclidean * 0.4;
    const compatibility = Math.round(Math.max(15, Math.min(95, 15 + similarity * 80)));
    return { genre, match: { cosine, euclidean, similarity, distance, compatibility } };
  }).sort((first, second) => second.match.similarity - first.match.similarity);
}
