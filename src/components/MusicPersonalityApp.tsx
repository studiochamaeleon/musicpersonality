'use client';

import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock3, Compass, Layers3, Sparkles } from 'lucide-react';
import { Question, GenreSchema, MUSICPersonality, EnhancedRecommendationScore, RecommendedArtist, MusicCatalog } from '@/types';
import { calculateMUSICScores, recommendGenres, recommendArtists } from '@/lib/musicCalculations';
import { createResultSearchParams, parseResultSearchParams } from '@/lib/resultTheme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { analytics } from '@/lib/analytics';
import DotMatrixBackground from '@/components/ui/DotMatrixBackground';
import { createComparisonHash, parseComparisonHash } from '@/lib/compatibility';
import { loadRecentResults, RecentMusicResult, saveRecentResult } from '@/lib/recentResults';
import { getGenreName } from '@/lib/genreTranslations';
import { removeBrowserStorage } from '@/lib/browserStorage';

const Survey = lazy(() => import('@/components/Survey'));
const PersonalityResults = lazy(() => import('@/components/PersonalityResults'));
const GenreExplorer = lazy(() => import('@/components/GenreExplorer'));
const CompatibilityInvite = lazy(() => import('@/components/CompatibilityInvite'));
const CompatibilityResults = lazy(() => import('@/components/CompatibilityResults'));

type AppState = 'intro' | 'survey' | 'results' | 'genre-explorer' | 'compare-invite' | 'comparison-results';

const MusicPersonalityApp: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const initializedFromUrl = useRef(false);
  const [appState, setAppState] = useState<AppState>('intro');
  const [personalityScores, setPersonalityScores] = useState<MUSICPersonality | null>(null);
  const [recommendedGenres, setRecommendedGenres] = useState<EnhancedRecommendationScore[]>([]);
  const [recommendedArtistsList, setRecommendedArtistsList] = useState<RecommendedArtist[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [genres, setGenres] = useState<GenreSchema[]>([]);
  const [musicCatalog, setMusicCatalog] = useState<MusicCatalog>({ version: 1, reviewedAt: '', genres: {} });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataLoadError, setDataLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [comparisonHostScores, setComparisonHostScores] = useState<MUSICPersonality | null>(null);
  const [comparisonGuestScores, setComparisonGuestScores] = useState<MUSICPersonality | null>(null);
  const [recentResults, setRecentResults] = useState<RecentMusicResult[]>([]);
  const languagePath = language === 'en' ? '/?lang=en' : '/';

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoadError(false);
        const [questionsModule, genresModule, catalogModule] = await Promise.all([
          import('@/data/questions.json'),
          import('@/data/genres.json'),
          import('@/data/musicCatalog.json'),
        ]);
        setQuestions(questionsModule.default as Question[]);
        setGenres(genresModule.default as GenreSchema[]);
        setMusicCatalog(catalogModule.default as MusicCatalog);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
        setDataLoadError(true);
      }
    };
    void loadData();
  }, [loadAttempt]);

  useEffect(() => {
    setRecentResults(loadRecentResults());
  }, []);

  const buildRecommendations = useCallback((scores: MUSICPersonality, nextGenres: GenreSchema[]) => {
    const recommendations = recommendGenres(scores, nextGenres, language);
    setRecommendedGenres(recommendations);
    setRecommendedArtistsList(recommendArtists(recommendations, nextGenres, musicCatalog, 6, language));
    return recommendations;
  }, [language, musicCatalog]);

  useEffect(() => {
    if (!dataLoaded || initializedFromUrl.current || typeof window === 'undefined') return;
    initializedFromUrl.current = true;
    const comparison = parseComparisonHash(window.location.hash);
    if (comparison) {
      setComparisonHostScores(comparison.hostScores);
      setComparisonGuestScores(comparison.guestScores);
      setAppState(comparison.guestScores ? 'comparison-results' : 'compare-invite');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const restoredScores = parseResultSearchParams(params);

    if (restoredScores) {
      setPersonalityScores(restoredScores);
      buildRecommendations(restoredScores, genres);
      setAppState('results');
    } else if (params.get('view') === 'genre-explorer') {
      setAppState('genre-explorer');
    }
  }, [buildRecommendations, dataLoaded, genres]);

  useEffect(() => {
    if (personalityScores && genres.length > 0) buildRecommendations(personalityScores, genres);
  }, [buildRecommendations, genres, personalityScores]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [appState]);

  const handleSurveyComplete = (answers: Record<string, number>) => {
    const scores = calculateMUSICScores(questions, answers);
    setPersonalityScores(scores);
    const recommendations = buildRecommendations(scores, genres);
    const topGenre = genres.find(genre => genre.id === recommendations[0]?.genreId);
    setRecentResults(saveRecentResult(scores, topGenre?.id || recommendations[0]?.genreId || 'unknown'));

    analytics.track('survey_completed', {
      personalityScores: scores,
      topGenre: topGenre?.name || 'Unknown',
      recommendedGenresCount: recommendations.length,
      completionTime: Date.now(),
    });

    if (comparisonHostScores) {
      setComparisonGuestScores(scores);
      analytics.track('compatibility_completed', {
        hostScores: comparisonHostScores,
        guestScores: scores,
      });
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', `${languagePath}#${createComparisonHash(comparisonHostScores, scores)}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setAppState('comparison-results');
      return;
    }

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/?${createResultSearchParams(scores, language).toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('intro');
    setPersonalityScores(null);
    setRecommendedGenres([]);
    setRecommendedArtistsList([]);
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    if (typeof window !== 'undefined') {
      removeBrowserStorage('session', 'music-personality-survey');
      window.history.replaceState({}, '', languagePath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGenreExplorer = () => {
    setAppState('genre-explorer');
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/?view=genre-explorer${language === 'en' ? '&lang=en' : ''}`);
  };

  const handleBackToIntro = () => {
    setAppState('intro');
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    if (typeof window !== 'undefined') window.history.replaceState({}, '', languagePath);
  };

  const handleCreateInvite = (scores: MUSICPersonality) => {
    setComparisonHostScores(scores);
    setComparisonGuestScores(null);
    setAppState('compare-invite');
    analytics.track('compatibility_invite_created', { hostScores: scores });
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `${languagePath}#${createComparisonHash(scores)}`);
  };

  const handleStartComparisonSurvey = () => {
    setComparisonGuestScores(null);
    removeBrowserStorage('session', 'music-personality-survey');
    setAppState('survey');
  };

  const handleUseRecentForComparison = (result: RecentMusicResult) => {
    if (!comparisonHostScores) return;
    setComparisonGuestScores(result.scores);
    setPersonalityScores(result.scores);
    setAppState('comparison-results');
    analytics.track('compatibility_completed', { source: 'recent-result' });
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `${languagePath}#${createComparisonHash(comparisonHostScores, result.scores)}`);
  };

  const handleViewGuestResult = () => {
    if (!comparisonGuestScores) return;
    setPersonalityScores(comparisonGuestScores);
    buildRecommendations(comparisonGuestScores, genres);
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    setAppState('results');
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/?${createResultSearchParams(comparisonGuestScores, language).toString()}`);
  };

  const handleInviteAnotherFriend = () => {
    if (!comparisonGuestScores) return;
    setPersonalityScores(comparisonGuestScores);
    buildRecommendations(comparisonGuestScores, genres);
    handleCreateInvite(comparisonGuestScores);
  };

  const handleBackFromInvite = () => {
    if (personalityScores) {
      setComparisonHostScores(null);
      setComparisonGuestScores(null);
      buildRecommendations(personalityScores, genres);
      setAppState('results');
      if (typeof window !== 'undefined') window.history.replaceState({}, '', `/?${createResultSearchParams(personalityScores, language).toString()}`);
      return;
    }
    handleBackToIntro();
  };

  const handleRestoreRecentResult = (result: RecentMusicResult) => {
    setPersonalityScores(result.scores);
    buildRecommendations(result.scores, genres);
    setAppState('results');
    analytics.track('recent_result_opened', { topGenreId: result.topGenreId });
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/?${createResultSearchParams(result.scores, language).toString()}`);
  };

  if (dataLoadError) return <main className="app-canvas flex min-h-screen flex-col items-center justify-center px-5 text-center text-white"><h1 className="text-2xl font-bold">{language === 'ko' ? '데이터를 불러오지 못했어요.' : 'We could not load the test.'}</h1><p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{language === 'ko' ? '연결을 확인한 뒤 다시 시도해 주세요.' : 'Please check your connection and try again.'}</p><button onClick={() => setLoadAttempt(attempt => attempt + 1)} className="primary-action mt-7">{language === 'ko' ? '다시 시도하기' : 'Try again'}</button></main>;
  if (!dataLoaded) return <LoadingSpinner message={t('common.loading.initializing')} />;

  if (appState === 'intro') {
    const copy = language === 'ko' ? {
      eyebrow: 'MUSIC PERSONALITY TEST',
      headline: '취향을 들으면,\n당신이 보입니다.',
      body: '좋아하는 음악에 답하고 나와 닮은 장르와 음악 성격을 발견해보세요.',
      cta: '내 음악 성격 찾기',
      explore: '장르별 성향 먼저 보기',
      note: '재미로 즐기는 음악 취향 테스트예요.',
      recent: '최근 결과',
    } : {
      eyebrow: 'MUSIC PERSONALITY TEST',
      headline: 'Your taste says\nmore than words.',
      body: 'Answer 40 quick questions and discover the genres that sound most like you.',
      cta: 'Find my music type',
      explore: 'Browse genre personalities',
      note: 'A lighthearted test inspired by music psychology.',
      recent: 'Recent results',
    };

    return (
      <main className="app-canvas text-white">
        <DotMatrixBackground />
        <div className="intro-matrix-fade pointer-events-none absolute inset-0" aria-hidden="true" />

        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm font-extrabold tracking-[-0.03em]">MUSIC PERSONALITY</p>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/35">BY CHAMELEONS</p>
          </div>
          <LanguageSelector />
        </header>

        <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center px-5 pb-12 pt-28 text-center sm:px-8">
          <div className="mx-auto max-w-5xl fade-in">
            <p className="eyebrow mb-5">{copy.eyebrow}</p>
            <h1 className={`${language === 'ko' ? 'text-[clamp(3.15rem,7.2vw,6.6rem)] font-extrabold leading-[0.92] tracking-[-0.07em]' : 'display-title'} whitespace-pre-line text-balance drop-shadow-[0_18px_60px_rgba(0,0,0,.65)]`}>
              {copy.headline.split('\n').map((line, index) => (
                <React.Fragment key={line}>
                  {index === 1 ? <span className="text-gradient">{line}</span> : line}
                  {index === 0 && <br />}
                </React.Fragment>
              ))}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">{copy.body}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => setAppState('survey')} className="primary-action group inline-flex items-center justify-center gap-2">
                {copy.cta}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={handleOpenGenreExplorer} className="secondary-action group inline-flex items-center justify-center gap-2">
                <Compass size={17} />
                {copy.explore}
              </button>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-white/65">
              <span className="inline-flex items-center gap-2"><Layers3 size={14} />40 {language === 'ko' ? '문항' : 'questions'}</span>
              <span className="inline-flex items-center gap-2"><Clock3 size={14} />{language === 'ko' ? '약 5분' : 'about 5 min'}</span>
              <span className="inline-flex items-center gap-2"><Sparkles size={14} />32 {language === 'ko' ? '개 장르' : 'genres'}</span>
            </div>
            <p className="mt-3 text-[11px] text-white/65">{copy.note}</p>
            {recentResults.length > 0 && (
              <details className="mx-auto mt-6 max-w-sm text-left">
                <summary className="cursor-pointer list-none text-center text-xs font-semibold text-white/70 transition-colors hover:text-white">{copy.recent} {recentResults.length} ↓</summary>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl">
                  {recentResults.map((result, index) => {
                    const genre = genres.find(item => item.id === result.topGenreId);
                    return (
                      <button key={result.id} onClick={() => handleRestoreRecentResult(result)} className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-xs text-white/55 transition-colors hover:bg-white/8 hover:text-white">
                        <span>{genre ? getGenreName(genre, language) : (language === 'ko' ? '음악 성격 결과' : 'Music personality result')}</span>
                        <span className="score-tabular text-[10px] text-white/25">#{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (appState === 'survey') {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.preparingSurvey')} />}>
        <Survey questions={questions} onComplete={handleSurveyComplete} onGoHome={handleBackToIntro} />
      </Suspense>
    );
  }

  if (appState === 'results' && personalityScores) {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.analyzingResults')} />}>
        <PersonalityResults
          personalityScores={personalityScores}
          recommendedGenres={recommendedGenres}
          genres={genres}
          recommendedArtists={recommendedArtistsList}
          onRestart={handleRestart}
          onInviteFriend={() => handleCreateInvite(personalityScores)}
        />
      </Suspense>
    );
  }

  if (appState === 'compare-invite' && comparisonHostScores) {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.initializing')} />}>
        <CompatibilityInvite
          hostScores={comparisonHostScores}
          genres={genres}
          recentResults={recentResults}
          onStartSurvey={handleStartComparisonSurvey}
          onUseRecent={handleUseRecentForComparison}
          onBack={handleBackFromInvite}
        />
      </Suspense>
    );
  }

  if (appState === 'comparison-results' && comparisonHostScores && comparisonGuestScores) {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.analyzingResults')} />}>
        <CompatibilityResults
          hostScores={comparisonHostScores}
          guestScores={comparisonGuestScores}
          genres={genres}
          onViewMyResult={handleViewGuestResult}
          onCreateInvite={handleInviteAnotherFriend}
          onRestart={handleRestart}
        />
      </Suspense>
    );
  }

  if (appState === 'genre-explorer') {
    return (
      <main className="relative isolate min-h-screen overflow-x-hidden bg-[#07080a] text-white">
        <DotMatrixBackground style={{ position: 'fixed' }} />
        <div className="intro-matrix-fade pointer-events-none fixed inset-0" aria-hidden="true" />
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#07080a]/90 px-5 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button onClick={handleBackToIntro} className="text-sm font-semibold text-white/65 transition-colors hover:text-white">← {t('common.buttons.backToHome')}</button>
            <LanguageSelector />
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner message={t('common.loading.loadingGenres')} />}>
          <GenreExplorer genres={genres} musicCatalog={musicCatalog} />
        </Suspense>
      </main>
    );
  }

  return <LoadingSpinner message={t('common.errorOccurred')} />;
};

export default MusicPersonalityApp;
