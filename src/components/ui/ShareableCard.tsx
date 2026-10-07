'use client';

import React, { CSSProperties, useRef } from 'react';
import { MUSICPersonality, GenreSchema } from '@/types';
import { analytics } from '@/lib/analytics';
import { useTranslation } from '@/hooks/useTranslation';
import { getGenreName, getGenreCharacteristics, getPersonalityAnalysis } from '@/lib/genreTranslations';
import { getGenreTheme, getResultUrl } from '@/lib/resultTheme';
import { useCardSharing } from '@/hooks/useCardSharing';
import ShareActions from './ShareActions';
import { getGenreSound, getResultIdentityCopy } from '@/lib/resultIdentity';
import { CURRENT_RESULT_VERSION, type ResultVersion } from '@/lib/resultVersion';
import { resultInterpretationCopy, exploratoryIdentity, type ResultInterpretationKind } from '@/lib/resultInterpretation';

interface ShareableCardProps {
  personalityScores: MUSICPersonality;
  topGenre: GenreSchema;
  topGenreScore: number;
  interpretationKind: ResultInterpretationKind;
  resultVersion?: ResultVersion;
  className?: string;
}

const ShareableCard: React.FC<ShareableCardProps> = ({ personalityScores, topGenre, topGenreScore, interpretationKind, resultVersion = CURRENT_RESULT_VERSION, className = '' }) => {
  const { t, language } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getGenreTheme(topGenre);
  const topTraits = Object.entries(personalityScores).sort(([, a], [, b]) => b - a).slice(0, 3);
  const personalityAnalysis = topGenre.personalityAnalysis
    ? getPersonalityAnalysis(topGenre.id, topGenre.personalityAnalysis, language, topGenre.characteristics)
    : null;
  const typeTitle = personalityAnalysis?.typeTitle || getGenreName(topGenre, language);
  const identityCopy = getResultIdentityCopy(language);
  const tentative = interpretationKind !== 'clear';
  const interpretationCopy = resultInterpretationCopy(interpretationKind, language);
  const identity = tentative ? { ...identityCopy, ...exploratoryIdentity(language) } : identityCopy;
  const genreSound = getGenreSound(topGenre.id, language);
  const cardStyle = { '--card-accent': theme.accent, '--card-secondary': theme.secondary } as CSSProperties;
  const copy = language === 'ko'
    ? { result: '결과 / 01', match: '장르 유사도', question: '너는 어떤 음악 타입?', disclaimer: '재미로 보는 음악 취향 · 진단 아님' }
    : language === 'ja'
      ? { result: '結果 / 01', match: 'ジャンル一致度', question: 'あなたの音楽タイプは？', disclaimer: '気軽に楽しむ音楽の好み · 診断ではありません' }
      : { result: 'RESULT / 01', match: 'genre similarity', question: 'WHAT IS YOUR MUSIC TYPE?', disclaimer: 'FOR FUN · NOT A DIAGNOSIS' };

  const getTraitName = (trait: string) => language !== 'en'
    ? t(`intro.musicModelTraits.${trait}.description`)
    : t(`intro.musicModelTraits.${trait}.name`);

  const sharing = useCardSharing({
    cardRef, language, url: getResultUrl(personalityScores, language, resultVersion),
    title: tentative ? `${interpretationCopy.badge} · ${getGenreName(topGenre, language)} · ${typeTitle}` : language === 'ko' ? `나의 음악 타입은 ${getGenreName(topGenre, language)} · ${typeTitle}` : language === 'ja' ? `私の音楽タイプは${getGenreName(topGenre, language)} · ${typeTitle}` : `My music type is ${getGenreName(topGenre, language)} · ${typeTitle}`,
    text: tentative ? `${getGenreName(topGenre, language)} · ${interpretationCopy.note}` : language === 'ko' ? `나는 ${getGenreName(topGenre, language)}와 닮은 ${typeTitle} 타입! 너는 어떤 음악 타입?` : language === 'ja' ? `私は${getGenreName(topGenre, language)}に似た「${typeTitle}」タイプ。あなたは？` : `I'm a ${typeTitle} with a ${getGenreName(topGenre, language)} sound. What's your music type?`,
    accent: theme.accent, secondary: theme.secondary, filename: 'muti-result.png', storyFilename: 'muti-story.png',
    onAction: shareType => analytics.track('result_shared', { shareType, topGenre: topGenre.name, personalityScores }),
  });

  return (
    <div className={`shareable-card-container ${className}`}>
      <div
        ref={cardRef}
        style={cardStyle}
        className={`relative mx-auto flex min-h-[620px] w-full max-w-[600px] overflow-hidden rounded-[32px] border border-white/20 bg-[#050507] p-7 text-white shadow-2xl sm:p-10 ${tentative ? 'sm:min-h-[800px]' : 'sm:aspect-[3/4] sm:min-h-0'}`}
      >
        <div className="absolute -right-[18%] -top-[8%] h-[58%] w-[72%] rounded-full opacity-45 blur-[80px]" style={{ background: theme.accent }} />
        <div className="absolute -bottom-[18%] -left-[18%] h-[55%] w-[70%] rounded-full opacity-28 blur-[90px]" style={{ background: theme.secondary }} />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
            <div><p className="text-sm font-extrabold tracking-[-0.03em]">MUTI</p><p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-white/40">MUSIC TASTE IDENTITY</p></div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-white/65">{copy.result}</p>
          </header>

          <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
            <p className="text-[10px] font-bold tracking-[0.14em] text-white/60">{identity.opening}</p>
            <h3 className="mt-2 font-extrabold leading-[1.06] tracking-[-0.06em] [overflow-wrap:anywhere]">
              <span className="text-[clamp(1.85rem,8vw,4.3rem)]" style={{ color: theme.accent }}>{identityCopy.quoteOpen}{getGenreName(topGenre, language)}{identityCopy.quoteClose}</span>{identity.ending && <span className={`${language === 'ko' ? 'ml-1' : ''} text-[clamp(1rem,3vw,1.75rem)] text-white`}>{identity.ending}</span>}
            </h3>
            <p className="mt-4 text-[11px] leading-5 text-white/70 sm:text-sm">{tentative ? `${exploratoryIdentity(language).sound} · ${genreSound}` : language === 'en' ? `${identityCopy.affinity} ${genreSound},` : `${genreSound}${identityCopy.affinity}`}</p>
            <p className="mt-1 text-[clamp(1.25rem,4.5vw,2.25rem)] font-extrabold leading-[1.12] tracking-[-0.04em] [overflow-wrap:anywhere]">{typeTitle}</p>
            <p className="score-tabular mt-5 text-6xl font-extrabold tracking-[-0.07em] sm:text-8xl" style={{ color: theme.accent }}>{topGenreScore}<span className="text-2xl">%</span></p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.15em] text-white/60 uppercase">{copy.match}</p>
            {tentative && <div data-testid="card-interpretation" data-kind={interpretationKind} className="mt-4 text-[11px] leading-5 text-white/75"><p className="font-bold" style={{ color: theme.accent }}>{interpretationCopy.badge}</p><p className="mt-1">{interpretationCopy.cardNote}</p></div>}

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
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><p className="text-[10px] leading-4 text-white/70">{copy.question}<br />{copy.disclaimer}</p><p className="shrink-0 self-end whitespace-nowrap text-[9px] font-bold tracking-[0.1em] text-white/65">BY CHAMELEONS</p></div>
          </footer>
        </div>
      </div>

      <ShareActions scope="personal" accent={theme.accent} sharing={sharing} />
    </div>
  );
};

export default ShareableCard;
