import genresData from '../src/data/genres.json';
import { getGenreTranslation } from '../src/lib/genreTranslations';
import { genreTranslationsJa } from '../src/lib/genreTranslationsJa';
import { MUSIC_SCORE_KEYS, type MusicScoreProfile } from '../src/lib/genreScore';
import { rankResultGenres } from '../src/lib/resultRanking';
import { CURRENT_RESULT_VERSION, type ResultVersion } from '../src/lib/resultVersion';
import type { Language } from '../src/types/i18n';
import { interpretResult, type ResultInterpretationKind } from '../src/lib/resultInterpretation';

interface GenreResultData {
  id: string;
  category: string;
  name: string;
  nameKo: string;
  personalityProfile: MusicScoreProfile;
  characteristics: string[];
  personalityAnalysis?: { typeTitle: string };
}

export interface PersonalResultSummary {
  interpretationKind: ResultInterpretationKind;
  genreId: string;
  genreCategory: string;
  genreName: string;
  genreNameKo: string;
  typeTitleKo: string;
  typeTitleEn: string;
  genreNameJa: string;
  typeTitleJa: string;
  compatibility: number;
  characteristics: string[];
}

const genres = genresData as GenreResultData[];

export function getPersonalResultSummary(scores: number[], version: ResultVersion = CURRENT_RESULT_VERSION): PersonalResultSummary {
  const user = Object.fromEntries(MUSIC_SCORE_KEYS.map((key, index) => [key, scores[index]])) as MusicScoreProfile;
  const ranked = rankResultGenres(user, genres, version);
  const top = ranked[0];

  return {
    interpretationKind: interpretResult(user, genres, version).kind,
    genreId: top.genre.id,
    genreCategory: top.genre.category,
    genreName: top.genre.name,
    genreNameKo: top.genre.nameKo,
    typeTitleKo: top.genre.personalityAnalysis?.typeTitle || top.genre.nameKo,
    typeTitleEn: getGenreTranslation(top.genre.id)?.personalityAnalysis?.typeTitle || top.genre.name,
    genreNameJa: genreTranslationsJa[top.genre.id]?.name || top.genre.name,
    typeTitleJa: genreTranslationsJa[top.genre.id]?.typeTitle || top.genre.name,
    compatibility: top.match.compatibility,
    characteristics: top.genre.characteristics.slice(0, 3),
  };
}

export function createResultAppPath(scores: number[], language: Language = 'ko', version: ResultVersion = CURRENT_RESULT_VERSION) {
  const params = new URLSearchParams({
    v: String(version),
    m: String(scores[0]),
    u: String(scores[1]),
    s: String(scores[2]),
    i: String(scores[3]),
    c: String(scores[4]),
  });
  params.set('lang', language);
  return `/?${params.toString()}`;
}
