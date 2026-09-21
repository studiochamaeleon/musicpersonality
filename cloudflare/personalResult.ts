import genresData from '../src/data/genres.json';
import { getGenreTranslation } from '../src/lib/genreTranslations';
import { rankGenres, MUSIC_SCORE_KEYS, type MusicScoreProfile } from '../src/lib/genreScore';

interface GenreResultData {
  id: string;
  name: string;
  nameKo: string;
  personalityProfile: MusicScoreProfile;
  characteristics: string[];
  personalityAnalysis?: { typeTitle: string };
}

export interface PersonalResultSummary {
  genreId: string;
  genreName: string;
  genreNameKo: string;
  typeTitleKo: string;
  typeTitleEn: string;
  compatibility: number;
  characteristics: string[];
}

const genres = genresData as GenreResultData[];

export function getPersonalResultSummary(scores: number[]): PersonalResultSummary {
  const user = Object.fromEntries(MUSIC_SCORE_KEYS.map((key, index) => [key, scores[index]])) as MusicScoreProfile;
  const ranked = rankGenres(user, genres);
  const top = ranked[0];

  return {
    genreId: top.genre.id,
    genreName: top.genre.name,
    genreNameKo: top.genre.nameKo,
    typeTitleKo: top.genre.personalityAnalysis?.typeTitle || top.genre.nameKo,
    typeTitleEn: getGenreTranslation(top.genre.id)?.personalityAnalysis?.typeTitle || top.genre.name,
    compatibility: top.match.compatibility,
    characteristics: top.genre.characteristics.slice(0, 3),
  };
}

export function createResultAppPath(scores: number[], language: 'ko' | 'en' = 'ko') {
  const params = new URLSearchParams({
    v: '2',
    m: String(scores[0]),
    u: String(scores[1]),
    s: String(scores[2]),
    i: String(scores[3]),
    c: String(scores[4]),
  });
  params.set('lang', language);
  return `/?${params.toString()}`;
}
