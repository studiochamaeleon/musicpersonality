export const MUSIC_SCORE_KEYS = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;

export type MusicScoreKey = (typeof MUSIC_SCORE_KEYS)[number];
export type MusicScoreProfile = Record<MusicScoreKey, number>;

function vector(profile: MusicScoreProfile): number[] {
  return MUSIC_SCORE_KEYS.map(key => profile[key]);
}

export function cosineSimilarity(user: MusicScoreProfile, genre: MusicScoreProfile): number {
  const userVector = vector(user);
  const genreVector = vector(genre);
  const dotProduct = userVector.reduce((sum, value, index) => sum + value * genreVector[index], 0);
  const userMagnitude = Math.hypot(...userVector);
  const genreMagnitude = Math.hypot(...genreVector);
  if (userMagnitude === 0 && genreMagnitude === 0) return 1;
  return userMagnitude === 0 || genreMagnitude === 0 ? 0 : Math.min(1, Math.max(0, dotProduct / (userMagnitude * genreMagnitude)));
}

export function euclideanSimilarity(user: MusicScoreProfile, genre: MusicScoreProfile): number {
  const distance = Math.hypot(...MUSIC_SCORE_KEYS.map(key => user[key] - genre[key]));
  return Math.max(0, 100 - distance / Math.sqrt(5 * 100 ** 2) * 100);
}

export function genreMatch(user: MusicScoreProfile, genre: MusicScoreProfile) {
  const cosine = cosineSimilarity(user, genre); // 0–1
  const euclidean = euclideanSimilarity(user, genre) / 100; // 0–1
  const weighted = cosine * 0.6 + euclidean * 0.4;

  // An editorial similarity index, not the probability that someone likes this genre.
  const compatibility = Math.round(Math.max(15, Math.min(95, 15 + weighted * 80)));
  return { cosine, euclidean, weighted, compatibility };
}

export function rankGenres<T extends { personalityProfile: MusicScoreProfile }>(user: MusicScoreProfile, genres: T[]) {
  return genres
    .map(genre => ({ genre, match: genreMatch(user, genre.personalityProfile) }))
    .sort((first, second) => second.match.weighted - first.match.weighted);
}
