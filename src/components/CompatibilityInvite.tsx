'use client';

import React, { CSSProperties, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Link2, LockKeyhole, Share2, Sparkles } from 'lucide-react';
import { GenreSchema, MUSICPersonality } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { recommendGenres } from '@/lib/musicCalculations';
import { getGenreName } from '@/lib/genreTranslations';
import { getGenreTheme } from '@/lib/resultTheme';
import { encodeScores, getComparisonUrl, MUSIC_TRAITS } from '@/lib/compatibility';
import { RecentMusicResult } from '@/lib/recentResults';
import { analytics } from '@/lib/analytics';
import LanguageSelector from '@/components/LanguageSelector';

interface CompatibilityInviteProps {
  hostScores: MUSICPersonality;
  genres: GenreSchema[];
  recentResults: RecentMusicResult[];
  onStartSurvey: () => void;
  onUseRecent: (result: RecentMusicResult) => void;
  onBack: () => void;
}

const TRAIT_LABELS = {
  ko: ['감성', '편안함', '탐구성', '강렬함', '트렌드'],
  en: ['Mellow', 'Easygoing', 'Sophisticated', 'Intense', 'Contemporary'],
};

const CompatibilityInvite: React.FC<CompatibilityInviteProps> = ({ hostScores, genres, recentResults, onStartSurvey, onUseRecent, onBack }) => {
  const { language } = useLanguage();
  const [feedback, setFeedback] = useState<string | null>(null);
  const hostRecommendation = useMemo(() => recommendGenres(hostScores, genres, language)[0], [genres, hostScores, language]);
  const eligibleRecentResult = useMemo(
    () => recentResults.find(result => encodeScores(result.scores) !== encodeScores(hostScores)),
    [hostScores, recentResults],
  );
  const hostGenre = genres.find(genre => genre.id === hostRecommendation?.genreId);
  const theme = getGenreTheme(hostGenre);
  const pageStyle = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;
  const copy = language === 'ko' ? {
    back: '돌아가기', eyebrow: 'MUSIC MATCH', title: '친구가 음악 궁합을\n기다리고 있어요.', body: '간단한 음악 취향 검사를 마치면 두 사람의 닮은 점, 다른 점, 함께 들으면 좋은 장르를 바로 확인할 수 있어요.',
    host: '친구의 음악 성격', match: '장르 유사도', start: '내 음악 성격 검사하기', recent: '최근 결과로 바로 궁합 보기', share: '초대 링크 보내기', copy: '링크 복사',
    privacy: '로그인 없이 진행되며, 점수는 이 링크와 내 브라우저에만 저장돼요.', time: '약 5분', questions: '40문항', fun: '가볍게 즐기는 테스트',
  } : {
    back: 'Back', eyebrow: 'MUSIC MATCH', title: 'A friend is waiting\nto compare tastes.', body: 'Finish a quick music taste test to see where you align, where you differ, and what you should listen to together.',
    host: "Friend's music personality", match: 'genre similarity', start: 'Take my music test', recent: 'Use my recent result', share: 'Send invite link', copy: 'Copy link',
    privacy: 'No login. Scores stay in this link and your browser.', time: 'about 5 min', questions: '40 questions', fun: 'just for fun',
  };

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getComparisonUrl(hostScores, null, language));
      analytics.track('compatibility_invite_shared', { shareType: 'copy' });
      notify(language === 'ko' ? '초대 링크를 복사했어요.' : 'Invite link copied.');
    } catch {
      notify(language === 'ko' ? '링크를 복사하지 못했어요.' : 'Could not copy the link.');
    }
  };

  const shareInvite = async () => {
    const url = getComparisonUrl(hostScores, null, language);
    try {
      if (navigator.share) {
        await navigator.share({
          title: language === 'ko' ? '우리 음악 궁합은 몇 퍼센트?' : 'How compatible are our music tastes?',
          text: language === 'ko' ? '내 음악 취향과 얼마나 닮았는지 확인해봐!' : 'Take the test and compare your music taste with mine.',
          url,
        });
        analytics.track('compatibility_invite_shared', { shareType: 'native' });
        return;
      }
      await copyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(language === 'ko' ? '공유하지 못했어요. 다시 시도해 주세요.' : 'Could not share. Please try again.');
    }
  };

  return (
    <main className="result-surface min-h-screen text-white" style={pageStyle}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><ArrowLeft size={15} />{copy.back}</button>
        <LanguageSelector />
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-84px)] max-w-6xl items-center gap-10 px-5 pb-14 pt-5 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="fade-in">
          <p className="eyebrow mb-5" style={{ color: theme.accent }}>{copy.eyebrow}</p>
          <h1 className="whitespace-pre-line text-[clamp(3rem,6vw,6rem)] font-extrabold leading-[.94] tracking-[-.065em] text-balance">{copy.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/58 sm:text-lg">{copy.body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => { analytics.track('compatibility_test_started'); onStartSurvey(); }} className="primary-action group inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}>
              {copy.start}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            {eligibleRecentResult && (
              <button onClick={() => onUseRecent(eligibleRecentResult)} className="secondary-action inline-flex items-center justify-center gap-2"><Clock3 size={17} />{copy.recent}</button>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => void shareInvite()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-xs font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"><Share2 size={15} />{copy.share}</button>
            <button onClick={() => void copyLink()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold text-white/70 transition-colors hover:text-white"><Link2 size={15} />{copy.copy}</button>
          </div>
          <div className="mt-2 min-h-5 text-xs text-white/45" aria-live="polite">{feedback && <span className="inline-flex items-center gap-1.5"><Check size={13} />{feedback}</span>}</div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
            <span>{copy.questions}</span><span>{copy.time}</span><span>{copy.fun}</span>
          </div>
          <p className="mt-4 flex max-w-xl items-start gap-2 text-[11px] leading-5 text-white/65"><LockKeyhole size={13} className="mt-0.5 shrink-0" />{copy.privacy}</p>
        </div>

        <article className="result-card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-[70px]" style={{ background: theme.accent }} />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div><p className="eyebrow mb-2">INVITE / 01</p><h2 className="text-lg font-bold">{copy.host}</h2></div>
              <Sparkles size={20} style={{ color: theme.accent }} />
            </div>
            <div className="py-8">
              <h3 className="max-w-[10ch] text-5xl font-extrabold leading-[.95] tracking-[-.055em] sm:text-6xl">{hostGenre ? getGenreName(hostGenre, language) : 'MUSIC TYPE'}</h3>
              <p className="score-tabular mt-5 text-5xl font-extrabold tracking-[-.06em]" style={{ color: theme.accent }}>{Math.round(hostRecommendation?.compatibility || 0)}<span className="text-lg">%</span></p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white/70">{copy.match}</p>
            </div>
            <div className="space-y-3 border-t border-white/10 pt-6">
              {MUSIC_TRAITS.map((trait, index) => (
                <div key={trait}>
                  <div className="mb-1.5 flex justify-between text-[10px] font-semibold text-white/70"><span>{TRAIT_LABELS[language][index]}</span><span className="score-tabular">{hostScores[trait]}</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${hostScores[trait]}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default CompatibilityInvite;
