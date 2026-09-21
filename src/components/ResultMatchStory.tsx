'use client';

import { useState } from 'react';
import { GenreSchema, MUSICPersonality } from '@/types';
import { MUSIC_SCORE_KEYS, type MusicScoreKey } from '@/lib/genreScore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface ResultMatchStoryProps {
  scores: MUSICPersonality;
  genre: GenreSchema;
  accent: string;
}

export default function ResultMatchStory({ scores, genre, accent }: ResultMatchStoryProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
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
    ? { eyebrow: '선택된 이유', title: '이 장르가 나온 이유', intro: '다섯 취향 축 중 가장 닮은 두 지점이에요.', yours: '나', genre: '장르', selected: '선택한 취향 축', compare: '다섯 축 직접 비교하기', about: '40개 자기보고 답변으로 만든 취향 점수와 미리 작성한 장르 프로필을 비교했습니다. 방향 유사도 60%, 점수 거리 40%를 합쳐 15~95 범위로 표시해요. 음악을 좋아할 확률이나 검증된 성격 진단 결과는 아닙니다.', gap: '점 차이' }
    : { eyebrow: 'WHY IT FITS', title: 'Why this genre?', intro: 'These two taste dimensions are your closest matches.', yours: 'You', genre: 'Genre', selected: 'Selected taste dimension', compare: 'Explore all five dimensions', about: 'We compare your self-reported answers to an editorial genre profile: 60% pattern similarity and 40% score distance, displayed on a 15–95 scale. This is not a probability or validated personality diagnosis.', gap: 'point gap' };

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow mb-2">{copy.eyebrow}</p><h2 className="text-xl font-bold tracking-[-0.03em] sm:text-2xl">{copy.title}</h2></div>
        <p className="text-xs leading-5 text-white/60">{copy.intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.slice(0, 2).map(match => (
          <div key={match.key} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold">{label(match.key)}</h3><span className="score-tabular text-xs font-semibold text-white/55">{match.gap} {copy.gap}</span></div>
            <div className="score-tabular mt-4 flex items-baseline gap-3 text-sm text-white/70"><span>{copy.yours} <strong className="text-lg text-white">{match.user}</strong></span><span aria-hidden="true" className="text-white/40">↔</span><span>{copy.genre} <strong className="text-lg" style={{ color: accent }}>{match.genre}</strong></span></div>
          </div>
        ))}
      </div>
      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold text-white/75">{copy.compare}</summary>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={copy.compare}>
          {MUSIC_SCORE_KEYS.map(key => (
            <button key={key} type="button" aria-pressed={activeTrait === key} onClick={() => setActiveTrait(key)} className={`min-h-11 rounded-full border px-4 text-xs font-semibold transition-colors ${activeTrait === key ? 'border-white/45 bg-white/15 text-white' : 'border-white/12 text-white/60 hover:border-white/30 hover:text-white'}`}>{label(key)}</button>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-black/25 p-4" role="region" aria-label={copy.selected}>
          <div className="flex items-baseline justify-between gap-3"><h3 className="font-bold">{label(active.key)}</h3><span className="score-tabular text-xs text-white/60">{active.gap} {copy.gap}</span></div>
          <p className="mt-2 text-sm leading-6 text-white/70">{t(`intro.musicTraitDescriptions.${active.key}`)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-semibold text-white/70">
            <div><div className="mb-2 flex justify-between"><span>{copy.yours}</span><span>{active.user}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-white" style={{ width: `${active.user}%` }} /></div></div>
            <div><div className="mb-2 flex justify-between"><span>{copy.genre}</span><span>{active.genre}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full" style={{ width: `${active.genre}%`, background: accent }} /></div></div>
          </div>
        </div>
      </details>
      <p className="mt-3 text-xs leading-5 text-white/60">{copy.about}</p>
    </div>
  );
}
