'use client';

import React, { CSSProperties, useRef, useState } from 'react';
import { Check, Download, Link2, Share2 } from 'lucide-react';
import { MUSICPersonality, GenreSchema } from '@/types';
import { analytics } from '@/lib/analytics';
import { useTranslation } from '@/hooks/useTranslation';
import { getGenreName, getGenreCharacteristics, getPersonalityAnalysis } from '@/lib/genreTranslations';
import { getGenreTheme, getResultUrl } from '@/lib/resultTheme';
import { captureCardBlob, saveCardImage } from '@/lib/cardExport';

interface ShareableCardProps {
  personalityScores: MUSICPersonality;
  topGenre: GenreSchema;
  topGenreScore: number;
  className?: string;
}

const ShareableCard: React.FC<ShareableCardProps> = ({ personalityScores, topGenre, topGenreScore, className = '' }) => {
  const { t, language } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const theme = getGenreTheme(topGenre);
  const topTraits = Object.entries(personalityScores).sort(([, a], [, b]) => b - a).slice(0, 3);
  const personalityAnalysis = topGenre.personalityAnalysis
    ? getPersonalityAnalysis(topGenre.id, topGenre.personalityAnalysis, language)
    : null;
  const typeTitle = personalityAnalysis?.typeTitle || getGenreName(topGenre, language);
  const cardStyle = { '--card-accent': theme.accent, '--card-secondary': theme.secondary } as CSSProperties;

  const getTraitName = (trait: string) => language === 'ko'
    ? t(`intro.musicModelTraits.${trait}.description`)
    : t(`intro.musicModelTraits.${trait}.name`);

  const createBlob = async () => {
    if (!cardRef.current) throw new Error('Card is not ready');
    return captureCardBlob(cardRef.current);
  };

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const share = async () => {
    const url = getResultUrl(personalityScores, language);
    const title = language === 'ko' ? `내 음악 성격은 ${typeTitle}` : `My music personality is ${typeTitle}`;
    const text = language === 'ko' ? `나는 ${getGenreName(topGenre, language)}와 닮은 ${typeTitle} 타입! 너는 어떤 음악 성격일까?` : `I'm a ${typeTitle} with a ${getGenreName(topGenre, language)} sound. What's your music type?`;
    analytics.track('result_shared', { shareType: 'unified', topGenre: topGenre.name, personalityScores });
    try {
      const blob = await createBlob();
      const file = new File([blob], 'music-personality-result.png', { type: 'image/png' });
      const data: ShareData = {
        title,
        text,
        url,
        files: [file],
      };
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      notify(language === 'ko' ? '결과 링크를 복사했어요.' : 'Result link copied.');
    } catch {
      notify(language === 'ko' ? '공유하지 못했어요. 다시 시도해 주세요.' : 'Could not share. Please try again.');
    }
  };

  const download = async () => {
    try {
      if (!cardRef.current) throw new Error('Card is not ready');
      await saveCardImage(
        cardRef.current,
        'music-personality-result.png',
        language === 'ko' ? '내 음악 성격 결과' : 'My music personality result',
      );
      analytics.track('result_shared', { shareType: 'download', topGenre: topGenre.name, personalityScores });
      notify(language === 'ko' ? '결과 이미지를 준비했어요.' : 'Result image is ready.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(language === 'ko' ? '이미지를 만들지 못했어요.' : 'Could not create the image.');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getResultUrl(personalityScores, language));
      notify(language === 'ko' ? '결과 링크를 복사했어요.' : 'Result link copied.');
    } catch {
      notify(language === 'ko' ? '링크를 복사하지 못했어요.' : 'Could not copy the link.');
    }
  };

  return (
    <div className={`shareable-card-container ${className}`}>
      <div
        ref={cardRef}
        style={cardStyle}
        className="relative mx-auto aspect-[3/4] w-full max-w-[600px] overflow-hidden rounded-[32px] border border-white/20 bg-[#050507] p-7 text-white shadow-2xl sm:p-10"
      >
        <div className="absolute -right-[18%] -top-[8%] h-[58%] w-[72%] rounded-full opacity-45 blur-[80px]" style={{ background: theme.accent }} />
        <div className="absolute -bottom-[18%] -left-[18%] h-[55%] w-[70%] rounded-full opacity-28 blur-[90px]" style={{ background: theme.secondary }} />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
            <div><p className="text-sm font-extrabold tracking-[-0.03em]">MUSIC PERSONALITY</p><p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-white/40">BY CHAMELEONS</p></div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-white/45">RESULT / 01</p>
          </header>

          <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
            <p className="text-[10px] font-bold tracking-[0.18em]" style={{ color: theme.accent }}>{language === 'ko' ? `나와 가장 닮은 장르 · ${getGenreName(topGenre, language)}` : `THE SOUND MOST LIKE ME · ${getGenreName(topGenre, language)}`}</p>
            <h3 className="mt-3 max-w-[10ch] text-5xl font-extrabold leading-[0.92] tracking-[-0.065em] sm:text-7xl">{typeTitle}</h3>
            <p className="score-tabular mt-6 text-6xl font-extrabold tracking-[-0.07em] sm:text-8xl" style={{ color: theme.accent }}>{topGenreScore}<span className="text-2xl">%</span></p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.15em] text-white/38 uppercase">{language === 'ko' ? '취향 일치' : 'taste match'}</p>

            <div className="mt-7 space-y-3 sm:mt-10">
              {topTraits.map(([trait, score]) => (
                <div key={trait}>
                  <div className="mb-1.5 flex justify-between text-[10px] font-semibold text-white/58"><span>{getTraitName(trait)}</span><span className="score-tabular">{score}</span></div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <footer className="border-t border-white/15 pt-5">
            <p className="line-clamp-1 text-[10px] text-white/48">{getGenreCharacteristics(topGenre.id, topGenre.characteristics, language).slice(0, 3).join('  ·  ')}</p>
            <div className="mt-3 flex items-end justify-between gap-4"><p className="text-[9px] leading-4 text-white/28">{language === 'ko' ? '너는 어떤 음악 타입?' : 'WHAT IS YOUR MUSIC TYPE?'}<br />FOR FUN, NOT A DIAGNOSIS</p><p className="text-[9px] font-bold tracking-[0.1em] text-white/42">BY CHAMELEONS</p></div>
          </footer>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button onClick={() => void share()} className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{language === 'ko' ? '공유하기' : 'Share'}</button>
        <button onClick={() => void download()} className="secondary-action inline-flex items-center justify-center gap-2"><Download size={17} />{language === 'ko' ? '이미지 저장' : 'Save image'}</button>
        <button onClick={() => void copyLink()} className="secondary-action inline-flex items-center justify-center gap-2"><Link2 size={17} />{language === 'ko' ? '링크 복사' : 'Copy link'}</button>
      </div>
      <div className="mt-3 min-h-6 text-center text-xs text-white/45" role="status" aria-live="polite">{feedback && <span className="inline-flex items-center gap-1.5"><Check size={13} />{feedback}</span>}</div>
    </div>
  );
};

export default ShareableCard;
