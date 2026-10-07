'use client';

import { useId, useState } from 'react';
import { GenreSchema, MUSICPersonality } from '@/types';
import { MUSIC_SCORE_KEYS, type MusicScoreKey } from '@/lib/genreScore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { CURRENT_RESULT_VERSION, type ResultVersion } from '@/lib/resultVersion';

interface ResultMatchStoryProps {
  scores: MUSICPersonality;
  genre: GenreSchema;
  accent: string;
  resultVersion?: ResultVersion;
}

export default function ResultMatchStory({ scores, genre, accent, resultVersion = CURRENT_RESULT_VERSION }: ResultMatchStoryProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const dimensionId = useId();
  const matches = MUSIC_SCORE_KEYS.map(key => ({
    key,
    user: scores[key],
    genre: genre.personalityProfile[key],
    gap: Math.abs(scores[key] - genre.personalityProfile[key]),
  })).sort((first, second) => first.gap - second.gap);
  const [activeTrait, setActiveTrait] = useState<MusicScoreKey>(matches[0].key);
  const active = matches.find(match => match.key === activeTrait) || matches[0];
  const label = (key: MusicScoreKey) => t(`intro.musicModelTraits.${key}.description`);
  const copy = language === 'ko'
    ? { eyebrow: '선택된 이유', title: '이 장르가 나온 이유', intro: '가장 가까운 지점과 차이가 큰 지점을 함께 보여드려요.', yours: '나', genre: '장르', selected: '선택한 취향 축', compare: '다섯 축 직접 비교하기', about: '40개 자기보고 답변으로 만든 다섯 취향 점수와 미리 작성한 장르 프로필의 차이를 비교했어요. 큰 차이는 더 크게 반영합니다. 표시된 점수는 음악을 좋아할 확률이나 성격 진단의 정확도가 아닙니다.', gap: '점 차이', close: '가까운 지점', contrast: '차이가 큰 지점' }
    : language === 'ja'
      ? { eyebrow: '選ばれた理由', title: 'なぜこのジャンル？', intro: '近い点と、大きく異なる点の両方を見てみましょう。', yours: 'あなた', genre: 'ジャンル', selected: '選択した好み軸', compare: '五つの軸を比較する', about: '40問の回答から得た五つの好みスコアと、編集したジャンルプロファイルの差を比較しています。大きな差をより強く反映します。この点数は好きになる確率や性格診断の精度ではありません。', gap: '点差', close: '近い点', contrast: '異なる点' }
      : { eyebrow: 'WHY IT FITS', title: 'Why this genre?', intro: 'See where your taste aligns and where it differs.', yours: 'You', genre: 'Genre', selected: 'Selected taste dimension', compare: 'Explore all five dimensions', about: 'We compare five self-reported taste scores with an editorial genre profile and give larger differences more weight. This score is not the probability you will like the music or a measure of personality-test accuracy.', gap: 'point gap', close: 'Closest match', contrast: 'Biggest contrast' };

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow mb-2">{copy.eyebrow}</p><h2 className="text-xl font-bold tracking-[-0.03em] sm:text-2xl">{copy.title}</h2></div>
        <p className="text-xs leading-5 text-white/60">{copy.intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[...matches.slice(0, 2), matches.at(-1)!].map((match, index) => (
          <div key={match.key} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="mb-2 text-[10px] font-semibold text-white/45">{index === 2 ? copy.contrast : copy.close}</p>
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold">{label(match.key)}</h3><span className="score-tabular text-xs font-semibold text-white/55">{match.gap} {copy.gap}</span></div>
            <div className="score-tabular mt-4 flex items-baseline gap-3 text-sm text-white/70"><span>{copy.yours} <strong className="text-lg text-white">{match.user}</strong></span><span aria-hidden="true" className="text-white/40">↔</span><span>{copy.genre} <strong className="text-lg" style={{ color: accent }}>{match.genre}</strong></span></div>
          </div>
        ))}
      </div>
      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold leading-5 text-white/75">{copy.compare}</summary>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={copy.compare}>
          {MUSIC_SCORE_KEYS.map(key => (
            <button key={key} type="button" aria-pressed={activeTrait === key} aria-controls={dimensionId} onClick={() => setActiveTrait(key)} className={`min-h-11 rounded-full border px-4 text-xs font-semibold transition-colors ${activeTrait === key ? 'border-white/45 bg-white/15 text-white' : 'border-white/12 text-white/60 hover:border-white/30 hover:text-white'}`}>{label(key)}</button>
          ))}
        </div>
        <div id={dimensionId} className="mt-5 rounded-xl bg-black/25 p-4" role="region" aria-label={`${copy.selected} · ${label(active.key)}`}>
          <div className="flex items-baseline justify-between gap-3"><h3 className="font-bold">{label(active.key)}</h3><span className="score-tabular text-xs text-white/60">{active.gap} {copy.gap}</span></div>
          <p className="mt-2 text-sm leading-6 text-white/70">{t(`intro.musicTraitDescriptions.${active.key}`)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-semibold text-white/70">
            <div><div className="mb-2 flex justify-between"><span>{copy.yours}</span><span>{active.user}</span></div><div role="meter" aria-label={`${copy.yours} · ${label(active.key)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={active.user} className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-white" style={{ width: `${active.user}%` }} /></div></div>
            <div><div className="mb-2 flex justify-between"><span>{copy.genre}</span><span>{active.genre}</span></div><div role="meter" aria-label={`${copy.genre} · ${label(active.key)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={active.genre} className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full" style={{ width: `${active.genre}%`, background: accent }} /></div></div>
          </div>
        </div>
      </details>
      <p className="mt-3 text-xs leading-5 text-white/60">{resultVersion === CURRENT_RESULT_VERSION ? copy.about : language === 'ko'
        ? '이 링크는 이전 결과 계산법을 유지합니다. 코사인 유사도 60%와 거리 유사도 40%를 합친 편집 지표이며, 좋아할 확률이나 성격 진단의 정확도가 아닙니다.'
        : language === 'ja'
          ? 'このリンクでは以前の計算方法を維持しています。コサイン類似度60％と距離類似度40％を合わせた参考値であり、好みの確率や診断精度ではありません。'
          : 'This link preserves the earlier calculation: 60% cosine similarity and 40% distance similarity. It is not a liking probability or diagnostic accuracy.'}</p>
    </div>
  );
}
