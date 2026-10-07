import type { MUSICPersonality } from '../types/index.ts';
import type { Language } from '../types/i18n.ts';
import { MUSIC_SCORE_KEYS } from './genreScore.ts';

const LABELS: Record<Language, Record<keyof MUSICPersonality, string>> = {
  ko: { mellow: '차분함', unpretentious: '편안함', sophisticated: '탐구성', intense: '강렬함', contemporary: '현대적 사운드' },
  en: { mellow: 'mellow', unpretentious: 'easygoing taste', sophisticated: 'exploration', intense: 'intensity', contemporary: 'contemporary taste' },
  ja: { mellow: '穏やかさ', unpretentious: '親しみやすさ', sophisticated: '探究心', intense: '力強さ', contemporary: '現代的な感覚' },
};

export function getPersonalizedResultSummary(
  scores: MUSICPersonality,
  genreProfile: MUSICPersonality,
  language: Language,
): string {
  const matches = MUSIC_SCORE_KEYS.map(key => ({
    key,
    gap: Math.abs(scores[key] - genreProfile[key]),
  })).sort((a, b) => a.gap - b.gap);
  const leading = [...MUSIC_SCORE_KEYS].sort((a, b) => scores[b] - scores[a])[0];
  const contrast = matches.at(-1)!;
  const [first, second] = matches;
  const label = LABELS[language];
  const balanced = Math.max(...MUSIC_SCORE_KEYS.map(key => scores[key])) - Math.min(...MUSIC_SCORE_KEYS.map(key => scores[key])) <= 10;

  if (language === 'ko') {
    const firstLabel = label[first.key];
    const last = firstLabel.charCodeAt(firstLabel.length - 1);
    const particle = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? '과' : '와';
    const intro = `${balanced ? '다섯 취향 점수가 비슷한 높이로 나타났어요.' : `당신의 답변에서는 ${label[leading]} ${scores[leading]}점이 가장 높았어요.`} 이 장르와는 ${firstLabel}${particle} ${label[second.key]}에서 상대적으로 가까웠습니다.`;
    return contrast.gap < 15 ? `${intro} 다섯 취향 축이 전반적으로 고르게 닮았어요.` : `${intro} ${label[contrast.key]}에는 ${contrast.gap}점 차이가 있어, 이 장르의 모든 곡이 취향이라는 뜻은 아니에요.`;
  }
  if (language === 'ja') {
    const intro = `${balanced ? '五つの好みのスコアが同じくらいでした。' : `回答では${label[leading]}が${scores[leading]}点で最も高くなりました。`}このジャンルとは${label[first.key]}と${label[second.key]}が特に近いです。`;
    return contrast.gap < 15 ? `${intro}五つの好みの軸が全体的に似ています。` : `${intro}${label[contrast.key]}には${contrast.gap}点の差があり、このジャンルのすべての曲が好みに合うという意味ではありません。`;
  }
  const intro = `${balanced ? 'Your five taste scores were fairly even.' : `Your highest taste score was ${label[leading]} at ${scores[leading]}.`} You align most closely with this genre on ${label[first.key]} and ${label[second.key]}.`;
  return contrast.gap < 15 ? `${intro} All five taste dimensions are fairly close.` : `${intro} There is a ${contrast.gap}-point gap on ${label[contrast.key]}, so every track in the genre may not be for you.`;
}
