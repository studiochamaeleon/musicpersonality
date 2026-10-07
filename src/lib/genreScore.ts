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
  const gaps = MUSIC_SCORE_KEYS.map(key => Math.abs(user[key] - genre[key]));
  // Root mean square distance makes a single large mismatch visible instead of
  // letting four close dimensions completely conceal it.
  const distance = Math.sqrt(gaps.reduce((sum, gap) => sum + gap ** 2, 0) / gaps.length);
  const similarity = Math.max(0, Math.min(1, 1 - distance / 100));

  // A direct comparison of five editorial profiles, not a liking probability.
  const compatibility = Math.round(similarity * 100);
  return { cosine, euclidean, similarity, distance, compatibility };
}

export function rankGenres<T extends { personalityProfile: MusicScoreProfile }>(user: MusicScoreProfile, genres: T[]) {
  return genres
    .map(genre => ({ genre, match: genreMatch(user, genre.personalityProfile) }))
    .sort((first, second) => second.match.similarity - first.match.similarity);
}
