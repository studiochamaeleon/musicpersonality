'use client';

import React, { CSSProperties, lazy } from 'react';
import { ArrowDown, ExternalLink, RotateCcw, Share2 } from 'lucide-react';
import { MUSICPersonality, EnhancedRecommendationScore, GenreSchema, RecommendedArtist } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateYouTubeSearchUrl, openYouTubeLink, getEnglishArtistName } from '@/lib/youtube';
import { getGenreDescription, getGenreCharacteristics, getPersonalityAnalysis, getGenreName, getArtistName, getArtistSubtitle } from '@/lib/genreTranslations';
import { analytics } from '@/lib/analytics';
import { getGenreTheme } from '@/lib/resultTheme';
import AnimatedSection from './ui/AnimatedSection';
import ShareableCard from './ui/ShareableCard';

const MUSICRadarChart = lazy(() => import('./ui/charts/MUSICRadarChart'));

interface PersonalityResultsProps {
  personalityScores: MUSICPersonality;
  recommendedGenres: EnhancedRecommendationScore[];
  genres: GenreSchema[];
  recommendedArtists?: RecommendedArtist[];
  onRestart?: () => void;
}

const PersonalityResults: React.FC<PersonalityResultsProps> = ({ personalityScores, recommendedGenres, genres, recommendedArtists = [], onRestart }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const topRecommendation = recommendedGenres[0];
  const topGenre = genres.find(genre => genre.id === topRecommendation?.genreId);
  const theme = getGenreTheme(topGenre);
  const personalityAnalysis = topGenre?.personalityAnalysis
    ? getPersonalityAnalysis(topGenre.id, topGenre.personalityAnalysis, language)
    : null;
  const pageStyle = {
    '--result-accent': theme.accent,
    '--result-secondary': theme.secondary,
  } as CSSProperties;

  if (!topGenre || !topRecommendation) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-white/60">{t('results.cannotLoadGenre')}</p></div>;
  }

  const traits = getGenreCharacteristics(topGenre.id, topGenre.characteristics, language).slice(0, 4);
  const resultCopy = language === 'ko'
    ? { eyebrow: '당신의 음악 성격', lead: '당신과 가장 닮은 사운드', match: '취향 일치', spectrum: '나의 취향 스펙트럼', spectrumBody: '다섯 개의 축이 당신의 음악 취향을 어떻게 구성하는지 보여줍니다.', next: '함께 들으면 좋은 장르', artists: '당신을 위한 아티스트', detail: '성격 해석 더 보기', share: '친구에게 내 결과 보여주기', again: '다시 검사하기' }
    : { eyebrow: 'YOUR MUSIC PERSONALITY', lead: 'The sound most like you', match: 'taste match', spectrum: 'Your taste spectrum', spectrumBody: 'Five dimensions show how your music taste is put together.', next: 'Genres to try next', artists: 'Artists for your taste', detail: 'Read the full personality note', share: 'Share my result', again: 'Take it again' };

  return (
    <main className="result-surface min-h-screen text-white" style={pageStyle}>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <AnimatedSection direction="fade" duration={0.45}>
          <div className="mb-12 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold tracking-[-0.03em]">MUSIC PERSONALITY</p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/30">RESULT CARD</p>
            </div>
            {onRestart && <button onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><RotateCcw size={15} />{resultCopy.again}</button>}
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-5" style={{ color: theme.accent }}>{resultCopy.eyebrow}</p>
              <p className="mb-3 text-sm text-white/45">{resultCopy.lead}</p>
              <h1 className="max-w-[12ch] text-6xl font-extrabold leading-[0.94] tracking-[-0.065em] text-balance sm:text-8xl lg:text-9xl">
                {getGenreName(topGenre, language)}
              </h1>
            </div>
            <div className="lg:pb-2 lg:text-right">
              <p className="score-tabular text-7xl font-extrabold tracking-[-0.07em] sm:text-8xl" style={{ color: theme.accent }}>{topRecommendation.compatibility}<span className="text-2xl">%</span></p>
              <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">{resultCopy.match}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1.25fr_.75fr]">
            <p className="max-w-2xl text-lg leading-8 text-white/67">{getGenreDescription(topGenre.id, topGenre.description, language)}</p>
            <div className="flex flex-wrap content-start gap-2 lg:justify-end">
              {traits.map(trait => <span key={trait} className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/68">{trait}</span>)}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#share" className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{resultCopy.share}</a>
            <a href="#spectrum" className="secondary-action inline-flex items-center justify-center gap-2">{resultCopy.spectrum}<ArrowDown size={17} /></a>
          </div>
        </AnimatedSection>
      </section>

      <section id="spectrum" className="border-y border-white/10 bg-black/15">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:py-24">
          <AnimatedSection delay={0.05}>
            <p className="eyebrow mb-4">MUSIC 5</p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.spectrum}</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/48">{resultCopy.spectrumBody}</p>
          </AnimatedSection>
          <div className="result-card overflow-hidden p-3 sm:p-6">
            <MUSICRadarChart personalityScores={personalityScores} animated showTooltip size="md" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="eyebrow mb-3">NEXT LISTEN</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.next}</h2></div>
          <p className="hidden text-xs text-white/30 sm:block">TOP 06</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedGenres.slice(0, 6).map((recommendation, index) => {
            const genre = genres.find(item => item.id === recommendation.genreId);
            if (!genre) return null;
            return (
              <article key={genre.id} className={`result-card group p-5 transition-transform duration-200 hover:-translate-y-1 ${index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="score-tabular text-xs text-white/28">0{index + 1}</span>
                  <span className="score-tabular text-sm font-bold" style={{ color: index === 0 ? theme.accent : 'rgba(255,255,255,.55)' }}>{recommendation.compatibility}%</span>
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-[-0.035em]">{getGenreName(genre, language)}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">{getGenreDescription(genre.id, genre.description, language)}</p>
                <div className="mt-5 flex flex-wrap gap-2">{getGenreCharacteristics(genre.id, genre.characteristics, language).slice(0, 2).map(value => <span key={value} className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">#{value}</span>)}</div>
              </article>
            );
          })}
        </div>
      </section>

      {recommendedArtists.length > 0 && (
        <section className="border-y border-white/10 bg-white/[0.018]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <p className="eyebrow mb-3">ARTIST PICKS</p>
            <h2 className="mb-8 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.artists}</h2>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedArtists.map((recommendation, index) => (
                <article key={`${recommendation.artist.name}-${index}`} className="bg-[#0d0d0f] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="font-bold">{getArtistName(recommendation.artist, language)}</h3><p className="mt-1 text-xs text-white/38">{getArtistSubtitle(recommendation.artist, language)}</p></div>
                    <span className="score-tabular text-xs font-bold text-white/42">{recommendation.compatibility}%</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {recommendation.artist.keyTracks.slice(0, 2).map(track => (
                      <button key={track} onClick={() => { analytics.track('youtube_track_click', { artist: recommendation.artist.name, track, genre: recommendation.genreName, compatibility: recommendation.compatibility }); openYouTubeLink(generateYouTubeSearchUrl(getEnglishArtistName(recommendation.artist.nameKo || recommendation.artist.name), track), track); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white">
                        {track}<ExternalLink size={11} />
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {personalityAnalysis && (
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <details className="result-card group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 sm:p-8">
              <div><p className="eyebrow mb-2">DEEP DIVE</p><h2 className="text-2xl font-bold tracking-[-0.03em]">{resultCopy.detail}</h2></div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition-transform group-open:rotate-180"><ArrowDown size={18} /></span>
            </summary>
            <div className="border-t border-white/10 p-6 sm:p-8">
              <h3 className="text-2xl font-bold">{personalityAnalysis.typeTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">{personalityAnalysis.description}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div><p className="eyebrow mb-3">{t('analysisReport.strengths')}</p><ul className="space-y-3 text-sm leading-6 text-white/58">{personalityAnalysis.strengths.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
                <div><p className="eyebrow mb-3">{t('analysisReport.challenges')}</p><ul className="space-y-3 text-sm leading-6 text-white/58">{personalityAnalysis.challenges.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
              </div>
            </div>
          </details>
        </section>
      )}

      <section id="share" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-8 text-center"><p className="eyebrow mb-3">SHOW YOUR RESULT</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{t('results.shareResults')}</h2><p className="mt-4 text-sm text-white/42">{t('results.shareDescription')}</p></div>
          <ShareableCard personalityScores={personalityScores} topGenre={topGenre} topGenreScore={Math.round(topRecommendation.compatibility)} />
          {onRestart && <div className="mt-8 text-center"><button onClick={onRestart} className="secondary-action !w-auto inline-flex items-center gap-2"><RotateCcw size={17} />{resultCopy.again}</button></div>}
        </div>
      </section>
    </main>
  );
};

export default PersonalityResults;
