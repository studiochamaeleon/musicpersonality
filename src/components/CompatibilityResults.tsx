'use client';

import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { ArrowLeft, Check, Download, Link2, RefreshCw, Share2, Sparkles, Users } from 'lucide-react';
import { GenreSchema, MUSICPersonality } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { averageScores, calculatePairCompatibility, getComparisonUrl } from '@/lib/compatibility';
import { recommendGenres } from '@/lib/musicCalculations';
import { getGenreName } from '@/lib/genreTranslations';
import { getGenreTheme } from '@/lib/resultTheme';
import { analytics } from '@/lib/analytics';
import LanguageSelector from '@/components/LanguageSelector';

interface CompatibilityResultsProps {
  hostScores: MUSICPersonality;
  guestScores: MUSICPersonality;
  genres: GenreSchema[];
  onViewMyResult: () => void;
  onCreateInvite: () => void;
  onRestart: () => void;
}

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ hostScores, guestScores, genres, onViewMyResult, onCreateInvite, onRestart }) => {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const compatibility = useMemo(() => calculatePairCompatibility(hostScores, guestScores, language), [guestScores, hostScores, language]);
  const hostRecommendation = useMemo(() => recommendGenres(hostScores, genres, language)[0], [genres, hostScores, language]);
  const guestRecommendation = useMemo(() => recommendGenres(guestScores, genres, language)[0], [genres, guestScores, language]);
  const jointRecommendations = useMemo(() => recommendGenres(averageScores(hostScores, guestScores), genres, language).slice(0, 3), [genres, guestScores, hostScores, language]);
  const hostGenre = genres.find(genre => genre.id === hostRecommendation?.genreId);
  const guestGenre = genres.find(genre => genre.id === guestRecommendation?.genreId);
  const theme = getGenreTheme(guestGenre || hostGenre);
  const pageStyle = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;
  const copy = language === 'ko' ? {
    back: '처음으로', eyebrow: 'OUR MUSIC MATCH', score: '두 사람의 음악 궁합', similar: '가장 닮은 취향', different: '가장 다른 취향', compare: '취향을 나란히 보기', friend: '친구', me: '나',
    together: '함께 들으면 좋은 장르', shareTitle: '이 궁합을 친구에게 보여주세요', shareBody: '결과 이미지를 저장하거나 링크로 공유하면 같은 화면을 다시 볼 수 있어요.', share: '결과 공유', save: '이미지 저장', copy: '링크 복사',
    myResult: '내 개인 결과 보기', another: '다른 친구와 비교하기', private: '두 점수는 링크 안에만 담기며 서버에 저장되지 않아요.',
  } : {
    back: 'Home', eyebrow: 'OUR MUSIC MATCH', score: 'Your music compatibility', similar: 'Closest match', different: 'Biggest contrast', compare: 'Taste, side by side', friend: 'Friend', me: 'Me',
    together: 'Genres to hear together', shareTitle: 'Share this match with your friend', shareBody: 'Save the card or share the link to reopen the same result.', share: 'Share result', save: 'Save image', copy: 'Copy link',
    myResult: 'View my result', another: 'Compare with another friend', private: 'Both scores live in this link and are never stored on a server.',
  };

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const makeCanvas = async () => {
    if (!cardRef.current) throw new Error('Card is not ready');
    return html2canvas(cardRef.current, { background: '#050507', useCORS: true, allowTaint: false });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getComparisonUrl(hostScores, guestScores));
      analytics.track('compatibility_result_shared', { shareType: 'copy', score: compatibility.score });
      notify(language === 'ko' ? '궁합 링크를 복사했어요.' : 'Match link copied.');
    } catch {
      notify(language === 'ko' ? '링크를 복사하지 못했어요.' : 'Could not copy the link.');
    }
  };

  const shareResult = async () => {
    const url = getComparisonUrl(hostScores, guestScores);
    try {
      const canvas = await makeCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image creation failed')), 'image/png'));
      const file = new File([blob], 'our-music-match.png', { type: 'image/png' });
      const data: ShareData = {
        title: language === 'ko' ? `우리 음악 궁합은 ${compatibility.score}%` : `Our music match is ${compatibility.score}%`,
        text: compatibility.title,
        url,
        files: [file],
      };
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        analytics.track('compatibility_result_shared', { shareType: 'native', score: compatibility.score });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: data.title, text: data.text, url });
        analytics.track('compatibility_result_shared', { shareType: 'native-link', score: compatibility.score });
        return;
      }
      await copyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(language === 'ko' ? '공유하지 못했어요. 다시 시도해 주세요.' : 'Could not share. Please try again.');
    }
  };

  const download = async () => {
    try {
      const canvas = await makeCanvas();
      const anchor = document.createElement('a');
      anchor.download = 'our-music-match.png';
      anchor.href = canvas.toDataURL('image/png');
      anchor.click();
      analytics.track('compatibility_result_shared', { shareType: 'download', score: compatibility.score });
      notify(language === 'ko' ? '궁합 이미지를 저장했어요.' : 'Match image saved.');
    } catch {
      notify(language === 'ko' ? '이미지를 만들지 못했어요.' : 'Could not create the image.');
    }
  };

  return (
    <main className="result-surface min-h-screen text-white" style={pageStyle}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><ArrowLeft size={15} />{copy.back}</button>
        <LanguageSelector />
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 text-center sm:px-8 sm:pt-12 lg:pb-24">
        <p className="eyebrow mb-5" style={{ color: theme.accent }}>{copy.eyebrow}</p>
        <p className="text-sm text-white/45">{copy.score}</p>
        <p className="score-tabular mt-2 text-[clamp(7rem,22vw,15rem)] font-extrabold leading-[.86] tracking-[-.085em]" style={{ color: theme.accent }}>{compatibility.score}<span className="text-[.22em]">%</span></p>
        <h1 className="mt-7 text-3xl font-bold tracking-[-.045em] sm:text-5xl">{compatibility.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{compatibility.description}</p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <article className="result-card p-5 text-left"><p className="text-[10px] font-bold tracking-[.14em] text-white/30">{copy.similar}</p><p className="mt-3 text-2xl font-bold">{compatibility.strongest.label}</p><p className="score-tabular mt-1 text-sm" style={{ color: theme.accent }}>{compatibility.strongest.similarity}% MATCH</p></article>
          <article className="result-card p-5 text-left"><p className="text-[10px] font-bold tracking-[.14em] text-white/30">{copy.different}</p><p className="mt-3 text-2xl font-bold">{compatibility.biggestDifference.label}</p><p className="score-tabular mt-1 text-sm text-white/42">{compatibility.biggestDifference.difference} POINT GAP</p></article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-9"><p className="eyebrow mb-3">MUSIC 5 / COMPARE</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.compare}</h2></div>
          <div className="result-card p-6 sm:p-8">
            <div className="mb-7 flex justify-end gap-5 text-[11px] font-semibold text-white/45"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-white/35" />{copy.friend}</span><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />{copy.me}</span></div>
            <div className="space-y-7">
              {compatibility.traits.map(trait => (
                <div key={trait.key}>
                  <div className="mb-3 flex items-end justify-between gap-4"><p className="font-semibold text-white/72">{trait.label}</p><p className="score-tabular text-xs text-white/35">{trait.similarity}% MATCH</p></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3"><span className="score-tabular w-7 text-right text-[10px] text-white/30">{trait.host}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-white/30" style={{ width: `${trait.host}%` }} /></div></div>
                    <div className="flex items-center gap-3"><span className="score-tabular w-7 text-right text-[10px]" style={{ color: theme.accent }}>{trait.guest}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full" style={{ width: `${trait.guest}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-9"><p className="eyebrow mb-3">LISTEN TOGETHER</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.together}</h2></div>
        <div className="grid gap-3 md:grid-cols-3">
          {jointRecommendations.map((recommendation, index) => {
            const genre = genres.find(item => item.id === recommendation.genreId);
            if (!genre) return null;
            return <article key={genre.id} className="result-card p-6"><div className="flex items-start justify-between"><span className="score-tabular text-xs text-white/25">0{index + 1}</span><span className="score-tabular text-sm font-bold" style={{ color: index === 0 ? theme.accent : 'rgba(255,255,255,.5)' }}>{recommendation.compatibility}%</span></div><h3 className="mt-10 text-3xl font-bold tracking-[-.04em]">{getGenreName(genre, language)}</h3></article>;
          })}
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-8 text-center"><p className="eyebrow mb-3">SHARE OUR MATCH</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.shareTitle}</h2><p className="mt-4 text-sm text-white/42">{copy.shareBody}</p></div>
          <div ref={cardRef} className="relative mx-auto aspect-[3/4] w-full max-w-[600px] overflow-hidden rounded-[32px] border border-white/20 bg-[#050507] p-7 shadow-2xl sm:p-10">
            <div className="absolute -right-[20%] -top-[8%] h-[60%] w-[75%] rounded-full opacity-40 blur-[85px]" style={{ background: theme.accent }} />
            <div className="absolute -bottom-[15%] -left-[18%] h-[50%] w-[70%] rounded-full opacity-25 blur-[90px]" style={{ background: theme.secondary }} />
            <div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
            <div className="relative z-10 flex h-full flex-col">
              <header className="flex items-start justify-between border-b border-white/15 pb-5"><div><p className="text-sm font-extrabold tracking-[-.03em]">MUSIC PERSONALITY</p><p className="mt-1 text-[9px] font-semibold tracking-[.18em] text-white/40">OUR MUSIC MATCH</p></div><Users size={18} className="text-white/45" /></header>
              <div className="flex flex-1 flex-col justify-center py-6 text-center">
                <p className="text-[10px] font-bold tracking-[.18em]" style={{ color: theme.accent }}>TASTE COMPATIBILITY</p>
                <p className="score-tabular mt-4 text-[clamp(5rem,20vw,9rem)] font-extrabold leading-none tracking-[-.08em]" style={{ color: theme.accent }}>{compatibility.score}<span className="text-[.25em]">%</span></p>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.04em] sm:text-4xl">{compatibility.title}</h3>
                <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-y border-white/12 py-5 text-left">
                  <div><p className="text-[9px] uppercase tracking-[.12em] text-white/35">{copy.friend}</p><p className="mt-1 line-clamp-2 text-lg font-bold">{hostGenre ? getGenreName(hostGenre, language) : 'MUSIC TYPE'}</p></div>
                  <Sparkles size={15} style={{ color: theme.accent }} />
                  <div className="text-right"><p className="text-[9px] uppercase tracking-[.12em] text-white/35">{copy.me}</p><p className="mt-1 line-clamp-2 text-lg font-bold">{guestGenre ? getGenreName(guestGenre, language) : 'MUSIC TYPE'}</p></div>
                </div>
              </div>
              <footer className="flex items-end justify-between border-t border-white/15 pt-5"><p className="text-[9px] leading-4 text-white/28">MUSIC 5 MODEL<br />FOR FUN, NOT A DIAGNOSIS</p><p className="text-[9px] font-bold tracking-[.1em] text-white/42">BY CHAMELEONS</p></footer>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button onClick={() => void shareResult()} className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{copy.share}</button>
            <button onClick={() => void download()} className="secondary-action inline-flex items-center justify-center gap-2"><Download size={17} />{copy.save}</button>
            <button onClick={() => void copyLink()} className="secondary-action inline-flex items-center justify-center gap-2"><Link2 size={17} />{copy.copy}</button>
          </div>
          <div className="mt-3 min-h-6 text-center text-xs text-white/45" aria-live="polite">{feedback && <span className="inline-flex items-center gap-1.5"><Check size={13} />{feedback}</span>}</div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={onViewMyResult} className="secondary-action inline-flex items-center justify-center gap-2"><Sparkles size={17} />{copy.myResult}</button>
            <button onClick={onCreateInvite} className="secondary-action inline-flex items-center justify-center gap-2"><RefreshCw size={17} />{copy.another}</button>
          </div>
          <p className="mt-6 text-center text-[11px] text-white/25">{copy.private}</p>
        </div>
      </section>
    </main>
  );
};

export default CompatibilityResults;
