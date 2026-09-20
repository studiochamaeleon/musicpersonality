import genresData from '../src/data/genres.json';

const TRAIT_KEYS = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;

interface GenreResultData {
  id: string;
  name: string;
  nameKo: string;
  personalityProfile: Record<(typeof TRAIT_KEYS)[number], number>;
  characteristics: string[];
  personalityAnalysis?: { typeTitle: string };
}

export interface PersonalResultSummary {
  genreId: string;
  genreName: string;
  genreNameKo: string;
  typeTitleKo: string;
  compatibility: number;
  characteristics: string[];
}

const genres = genresData as GenreResultData[];

function cosineSimilarity(user: number[], genre: number[]) {
  const dotProduct = user.reduce((sum, value, index) => sum + value * genre[index], 0);
  const userMagnitude = Math.sqrt(user.reduce((sum, value) => sum + value * value, 0));
  const genreMagnitude = Math.sqrt(genre.reduce((sum, value) => sum + value * value, 0));
  return userMagnitude === 0 || genreMagnitude === 0 ? 0 : dotProduct / (userMagnitude * genreMagnitude);
}

function euclideanSimilarity(user: number[], genre: number[]) {
  const distance = Math.sqrt(user.reduce((sum, value, index) => sum + Math.pow(value - genre[index], 2), 0));
  return Math.max(0, 100 - (distance / Math.sqrt(5 * Math.pow(100, 2))) * 100);
}

function compatibilityFor(scores: number[], genre: GenreResultData) {
  const profile = TRAIT_KEYS.map(key => genre.personalityProfile[key]);
  const weightedScore = (cosineSimilarity(scores, profile) * 0.6 + euclideanSimilarity(scores, profile) * 0.4) * 0.01;
  return Math.round(Math.max(15, Math.min(95, 15 + weightedScore * 80)));
}

export function getPersonalResultSummary(scores: number[]): PersonalResultSummary {
  const ranked = genres
    .map(genre => ({ genre, compatibility: compatibilityFor(scores, genre) }))
    .sort((a, b) => b.compatibility - a.compatibility);
  const top = ranked[0];

  return {
    genreId: top.genre.id,
    genreName: top.genre.name,
    genreNameKo: top.genre.nameKo,
    typeTitleKo: top.genre.personalityAnalysis?.typeTitle || top.genre.nameKo,
    compatibility: top.compatibility,
    characteristics: top.genre.characteristics.slice(0, 3),
  };
}

export function createResultAppPath(scores: number[], language: 'ko' | 'en' = 'ko') {
  const params = new URLSearchParams({
    v: '1',
    m: String(scores[0]),
    u: String(scores[1]),
    s: String(scores[2]),
    i: String(scores[3]),
    c: String(scores[4]),
  });
  if (language === 'en') params.set('lang', 'en');
  return `/?${params.toString()}`;
}
