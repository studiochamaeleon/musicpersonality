import type { Language } from '../types/i18n.ts';
import { MUSIC_SCORE_KEYS, type MusicScoreProfile } from './genreScore.ts';
import { rankResultGenres } from './resultRanking.ts';
import { CURRENT_RESULT_VERSION, type ResultVersion } from './resultVersion.ts';

// Editorial explanation thresholds, NOT validated confidence or quality scores.
export const EVEN_PROFILE_SPREAD = 10;
export const NEARBY_GENRE_GAP = 3;
export const EXPLORATION_MATCH = 60;
export type ResultInterpretationKind = 'neutral' | 'broad' | 'even' | 'explore' | 'nearby' | 'clear';

export function interpretResult(
  scores: MusicScoreProfile,
  genres: { id: string; personalityProfile: MusicScoreProfile }[],
  version: ResultVersion = CURRENT_RESULT_VERSION,
) {
  const values = MUSIC_SCORE_KEYS.map(key => scores[key]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum;
  const ranked = rankResultGenres(scores, genres, version);
  const top = ranked[0]?.match;
  const next = ranked[1]?.match;
  const gap = top && next ? (top.similarity - next.similarity) * 100 : null;
  let kind: ResultInterpretationKind = 'clear';
  if (!top || top.compatibility < EXPLORATION_MATCH) kind = 'explore';
  else if (spread <= EVEN_PROFILE_SPREAD) {
    kind = minimum >= 45 && maximum <= 55 ? 'neutral' : minimum >= 65 ? 'broad' : 'even';
  } else if (gap !== null && gap <= NEARBY_GENRE_GAP) kind = 'nearby';
  return { kind, tentative: kind !== 'clear', spread, gap };
}

export function resultInterpretationCopy(kind: ResultInterpretationKind, language: Language) {
  const copy = {
    ko: {
      neutral: { badge: '중간에 가까운 취향', note: '다섯 점수가 중간에 가까워 취향이 뚜렷하게 나뉘지 않았어요. 이 장르는 탐색의 출발점이며, 좋아한다고 단정하는 결과는 아니에요.' },
      broad: { badge: '폭넓게 열린 취향', note: '여러 음악적 특성을 고르게 선호한다고 답했어요. 한 장르로 제한하지 않고, 가까운 장르 중 하나를 먼저 소개해요.' },
      even: { badge: '고르게 나타난 취향', note: '다섯 취향 점수의 차이가 작아요. 한 방향이 두드러지지 않아, 가까운 장르 중 하나를 탐색용으로 소개해요.' },
      explore: { badge: '새로운 음악 탐색', note: '현재 장르 목록에서 뚜렷하게 가까운 프로필은 없어요. 가장 가까운 장르부터 탐색해보세요. 좋아할 것이라는 예측은 아니에요.' },
      nearby: { badge: '가까운 장르 중 하나', note: '상위 장르들의 차이가 작아요. 하나로 확정하기보다 함께 추천된 장르도 들어보세요.' },
      clear: { badge: '나의 음악 성격', note: '' },
    },
    en: {
      neutral: { badge: 'Taste near the middle', note: 'Your five scores sit near the middle without a distinct direction. This genre is a starting point for exploration, not an established favorite.' },
      broad: { badge: 'Open to many sounds', note: 'You reported a broad preference for several sound qualities. This is one nearby genre to explore, not a limit on your taste.' },
      even: { badge: 'An even taste profile', note: 'Your five taste scores are close together. With no standout direction, we introduce one nearby genre to explore.' },
      explore: { badge: 'A discovery starting point', note: 'No profile in the current catalogue is particularly close. Try the nearest genre as a discovery, not a prediction that you will enjoy it.' },
      nearby: { badge: 'One of your nearby genres', note: 'The leading genres are close together. Try the other recommendations rather than treating one as a definitive label.' },
      clear: { badge: 'My music personality', note: '' },
    },
    ja: {
      neutral: { badge: '中間に近い好み', note: '五つのスコアが中間に近く、好みの方向がまだ明確ではありません。このジャンルは探索の入口で、好きと断定する結果ではありません。' },
      broad: { badge: '幅広い音に開かれた好み', note: 'さまざまな音の特徴を好むと回答しました。一つに限定せず、近いジャンルの一つを紹介します。' },
      even: { badge: '均等に表れた好み', note: '五つの好みの差が小さく、特定の方向は目立ちません。近いジャンルの一つを探索用に紹介します。' },
      explore: { badge: '新しい音楽を探索', note: '現在の一覧には、はっきり近いプロファイルがありません。最も近いジャンルから探索してみましょう。好きになるという予測ではありません。' },
      nearby: { badge: '近いジャンルの一つ', note: '上位ジャンルの差は小さいため、一つに決めず、ほかのおすすめも聴いてみましょう。' },
      clear: { badge: '私の音楽性格', note: '' },
    },
  } as const;
  const cardNotes = {
    ko: {
      neutral: '다섯 취향이 중간에 가까워요. 탐색용 추천이며, 확정된 취향은 아니에요.',
      broad: '여러 소리를 고르게 선호했어요. 한 장르가 아닌 폭넓은 탐색의 시작이에요.',
      even: '취향 축의 차이가 작아요. 한 방향으로 단정하지 않고 탐색용으로 소개해요.',
      explore: '뚜렷하게 가까운 장르는 없어요. 좋아할 것이라는 예측이 아닌 탐색용 추천이에요.',
      nearby: '상위 장르의 차이가 작아요. 함께 추천된 음악도 들어보세요.',
      clear: '',
    },
    en: {
      neutral: 'Your scores sit near the middle. A starting point to explore, not an established favorite.',
      broad: 'You preferred many sound qualities. One starting point, not a limit on your taste.',
      even: 'Your taste dimensions are close together. Explore this genre without treating it as a fixed label.',
      explore: 'No genre is particularly close. A discovery to try, not a prediction that you will like it.',
      nearby: 'The leading genres are close. Try the other recommendations too.',
      clear: '',
    },
    ja: {
      neutral: '五つの好みは中間に近い値です。探索用のおすすめで、好みの断定ではありません。',
      broad: 'さまざまな音を好むと回答しました。一つに限定せず、幅広く探索してみましょう。',
      even: '好みの軸の差は小さく、特定の方向に決めつけず、探索用に紹介します。',
      explore: 'はっきり近いジャンルはありません。好きになる予測ではなく、探索用の提案です。',
      nearby: '上位ジャンルの差は小さいため、ほかのおすすめも聴いてみましょう。',
      clear: '',
    },
  } as const;
  return { ...copy[language][kind], cardNote: cardNotes[language][kind] };
}

export function exploratoryIdentity(language: Language) {
  return language === 'ko' ? { opening: '지금 탐색할 음악은', ending: '', sound: '이 장르의 소리' }
    : language === 'ja' ? { opening: '今、探索したい音楽は', ending: '', sound: 'このジャンルの音' }
      : { opening: 'A sound to explore', ending: '', sound: 'The sound' };
}
