'use client';

import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock3, Compass, Layers3, Sparkles } from 'lucide-react';
import { Question, GenreSchema, MUSICPersonality, EnhancedRecommendationScore, RecommendedArtist, MusicCatalog } from '@/types';
import { calculateMUSICScores, recommendGenres, recommendArtists } from '@/lib/musicCalculations';
import { createResultSearchParams, getResultUrl, getResultVersionFromSearchParams, parseResultSearchParams } from '@/lib/resultTheme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { analytics } from '@/lib/analytics';
import DotMatrixBackground from '@/components/ui/DotMatrixBackground';
import { createComparisonHash, getComparisonUrl, parseComparisonHash } from '@/lib/compatibility';
import { deleteRecentResult, getRecentResultVersion, loadRecentResults, RECENT_RESULTS_STORAGE_KEY, RecentMusicResult, saveRecentResultWithStatus } from '@/lib/recentResults';
import { CURRENT_RESULT_VERSION, type ResultVersion } from '@/lib/resultVersion';
import { getGenreName } from '@/lib/genreTranslations';
import { readBrowserStorage, removeBrowserStorage } from '@/lib/browserStorage';
import { deleteRecentComparison, loadRecentComparisons, RECENT_COMPARISONS_STORAGE_KEY, saveRecentComparisonWithStatus, type RecentComparison } from '@/lib/recentComparisons';
import { calculatePairCompatibility } from '@/lib/compatibility';
import { resumableSurveyDraft, SURVEY_DRAFT_STORAGE_KEY, surveyAnswerProgress, type RestoredSurveyDraft } from '@/lib/surveySession';

import AppScreenBoundary from '@/components/ui/AppScreenBoundary';
import HistorySaveNotice from '@/components/ui/HistorySaveNotice';
import { screenFailureNeedsReload } from '@/lib/screenRecovery';

function createLazyScreens() {
  // A rejected React.lazy promise is cached: an explicit retry needs new wrappers.
  return {
    Survey: lazy(() => import('@/components/Survey')),
    PersonalityResults: lazy(() => import('@/components/PersonalityResults')),
    GenreExplorer: lazy(() => import('@/components/GenreExplorer')),
    CompatibilityInvite: lazy(() => import('@/components/CompatibilityInvite')),
    CompatibilityResults: lazy(() => import('@/components/CompatibilityResults')),
  };
}

type AppState = 'intro' | 'survey' | 'results' | 'genre-explorer' | 'compare-invite' | 'comparison-results';

function navigateApp(url: string, replace = false, extras: Record<string, unknown> = {}) {
  const depth = Number(window.history.state?.mutiDepth) || 0;
  const state = { ...window.history.state, mutiDepth: replace ? depth : depth + 1, mutiCreatedInvite: undefined, ...extras };
  if (replace) window.history.replaceState(state, '', url);
  else window.history.pushState(state, '', url);
}

function goBackInApp(): boolean {
  if ((Number(window.history.state?.mutiDepth) || 0) <= 0) return false;
  window.history.back();
  return true;
}

const MusicPersonalityApp: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const initializedFromUrl = useRef(false);
  const [appState, setAppState] = useState<AppState>('intro');
  const [personalityScores, setPersonalityScores] = useState<MUSICPersonality | null>(null);
  const [resultVersion, setResultVersion] = useState<ResultVersion>(CURRENT_RESULT_VERSION);
  const [recommendedGenres, setRecommendedGenres] = useState<EnhancedRecommendationScore[]>([]);
  const [recommendedArtistsList, setRecommendedArtistsList] = useState<RecommendedArtist[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [genres, setGenres] = useState<GenreSchema[]>([]);
  const [musicCatalog, setMusicCatalog] = useState<MusicCatalog>({ version: 1, reviewedAt: '', genres: {} });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataLoadError, setDataLoadError] = useState(false);
  const [dataLoadNeedsReload, setDataLoadNeedsReload] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [comparisonHostScores, setComparisonHostScores] = useState<MUSICPersonality | null>(null);
  const [inviteMode, setInviteMode] = useState<'create' | 'respond'>('respond');
  const [comparisonHostVersion, setComparisonHostVersion] = useState<ResultVersion>(CURRENT_RESULT_VERSION);
  const [comparisonGuestScores, setComparisonGuestScores] = useState<MUSICPersonality | null>(null);
  const [comparisonGuestVersion, setComparisonGuestVersion] = useState<ResultVersion>(CURRENT_RESULT_VERSION);
  const [recentResults, setRecentResults] = useState<RecentMusicResult[]>([]);
  const [recentComparisons, setRecentComparisons] = useState<RecentComparison[]>([]);
  const [historyDeletion, setHistoryDeletion] = useState<'deleted' | 'failed' | null>(null);
  const historyFocusAfterDelete = useRef<'personal' | 'comparison' | null>(null);
  const latestPersonalRef = useRef<HTMLButtonElement>(null);
  const latestComparisonRef = useRef<HTMLButtonElement>(null);
  const [resumeChoice, setResumeChoice] = useState<RestoredSurveyDraft | null>(null);
  const [surveyFreshStart, setSurveyFreshStart] = useState(false);
  const [lazyScreens, setLazyScreens] = useState(createLazyScreens);
  const [screenAttempt, setScreenAttempt] = useState(0);
  const [failedPersonalSaveKey, setFailedPersonalSaveKey] = useState<string | null>(null);
  const [failedComparisonSaveKey, setFailedComparisonSaveKey] = useState<string | null>(null);
  const { Survey, PersonalityResults, GenreExplorer, CompatibilityInvite, CompatibilityResults } = lazyScreens;
  const resumeHeadingRef = useRef<HTMLHeadingElement>(null);
  const startSurveyRef = useRef<HTMLButtonElement>(null);
  const languagePath = language === 'ko' ? '/' : `/?lang=${language}`;

  useEffect(() => {
    const group = historyFocusAfterDelete.current;
    if (!group) return;
    historyFocusAfterDelete.current = null;
    const next = group === 'personal' ? latestPersonalRef.current : latestComparisonRef.current;
    (next ?? startSurveyRef.current)?.focus({ preventScroll: true });
  }, [recentResults, recentComparisons]);

  useEffect(() => { setHistoryDeletion(null); }, [appState]);

  const handleDeleteHistory = (kind: 'personal' | 'comparison', id: string) => {
    const remaining = kind === 'personal' ? deleteRecentResult(id) : deleteRecentComparison(id);
    const failed = remaining.some(result => result.id === id);
    setHistoryDeletion(failed ? 'failed' : 'deleted');
    if (!failed) historyFocusAfterDelete.current = kind;
    if (kind === 'personal') setRecentResults(remaining as RecentMusicResult[]);
    else setRecentComparisons(remaining as RecentComparison[]);
  };

  useEffect(() => {
    if (appState !== 'intro') setResumeChoice(null);
    else if (resumeChoice) resumeHeadingRef.current?.focus({ preventScroll: false });
  }, [appState, resumeChoice]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoadError(false);
        setDataLoadNeedsReload(false);
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
        setDataLoadNeedsReload(screenFailureNeedsReload(error));
      }
    };
    void loadData();
  }, [loadAttempt]);

  useEffect(() => {
    const refreshHistory = () => {
      setRecentResults(loadRecentResults());
      setRecentComparisons(loadRecentComparisons());
    };
    const syncHistory = (event: StorageEvent) => {
      if (event.key === null || event.key === RECENT_RESULTS_STORAGE_KEY || event.key === RECENT_COMPARISONS_STORAGE_KEY) refreshHistory();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshHistory();
    };
    refreshHistory();
    window.addEventListener('storage', syncHistory);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('storage', syncHistory);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (appState === 'comparison-results' && comparisonHostScores && comparisonGuestScores) {
      const outcome = saveRecentComparisonWithStatus(comparisonHostScores, comparisonGuestScores, comparisonHostVersion, comparisonGuestVersion);
      setRecentComparisons(outcome.results);
      setFailedComparisonSaveKey(outcome.saved ? null : createComparisonHash(comparisonHostScores, comparisonGuestScores, { hostVersion: comparisonHostVersion, guestVersion: comparisonGuestVersion }));
    }
  }, [appState, comparisonHostScores, comparisonGuestScores, comparisonHostVersion, comparisonGuestVersion]);

  const buildRecommendations = useCallback((scores: MUSICPersonality, nextGenres: GenreSchema[], version: ResultVersion = CURRENT_RESULT_VERSION) => {
    const recommendations = recommendGenres(scores, nextGenres, language, version);
    setRecommendedGenres(recommendations);
    setRecommendedArtistsList(recommendArtists(recommendations, nextGenres, musicCatalog, 6, language));
    return recommendations;
  }, [language, musicCatalog]);

  useEffect(() => {
    if (!dataLoaded) return;
    const restoreLocation = () => {
      setSurveyFreshStart(false);
      const params = new URLSearchParams(window.location.search);
      const comparison = parseComparisonHash(window.location.hash);
      setComparisonHostScores(comparison?.hostScores ?? null);
      setComparisonGuestScores(comparison?.guestScores ?? null);
      if (comparison) {
        setInviteMode(window.history.state?.mutiCreatedInvite === window.location.hash.slice(1) ? 'create' : 'respond');
        setComparisonHostVersion(comparison.hostVersion);
        setComparisonGuestVersion(comparison.guestVersion);
        setAppState(comparison.guestScores ? 'comparison-results' : params.get('view') === 'survey' ? 'survey' : 'compare-invite');
        return;
      }
      const restoredScores = parseResultSearchParams(params);
      setPersonalityScores(restoredScores);
      if (restoredScores) {
        const restoredVersion = getResultVersionFromSearchParams(params);
        setResultVersion(restoredVersion);
        buildRecommendations(restoredScores, genres, restoredVersion);
        setAppState('results');
      } else {
        setAppState(params.get('view') === 'genre-explorer' ? 'genre-explorer' : params.get('view') === 'survey' ? 'survey' : 'intro');
      }
    };
    if (!initializedFromUrl.current) {
      initializedFromUrl.current = true;
      window.history.replaceState({ ...window.history.state, mutiDepth: Number(window.history.state?.mutiDepth) || 0 }, '', window.location.href);
      restoreLocation();
    }
    window.addEventListener('popstate', restoreLocation);
    return () => window.removeEventListener('popstate', restoreLocation);
  }, [buildRecommendations, dataLoaded, genres]);

  useEffect(() => {
    if (personalityScores && genres.length > 0) buildRecommendations(personalityScores, genres, resultVersion);
  }, [buildRecommendations, genres, personalityScores, resultVersion]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [appState]);

  const handleSurveyComplete = (answers: Record<string, number>) => {
    const scores = calculateMUSICScores(questions, answers);
    setPersonalityScores(scores);
    setResultVersion(CURRENT_RESULT_VERSION);
    const recommendations = buildRecommendations(scores, genres, CURRENT_RESULT_VERSION);
    const topGenre = genres.find(genre => genre.id === recommendations[0]?.genreId);
    const outcome = saveRecentResultWithStatus(scores, topGenre?.id || recommendations[0]?.genreId || 'unknown');
    setRecentResults(outcome.results);
    setFailedPersonalSaveKey(outcome.saved ? null : createResultSearchParams(scores, 'ko', CURRENT_RESULT_VERSION).toString());

    analytics.track('survey_completed', {
      personalityScores: scores,
      topGenre: topGenre?.name || 'Unknown',
      recommendedGenresCount: recommendations.length,
      completionTime: Date.now(),
    });

    if (comparisonHostScores) {
      setComparisonGuestScores(scores);
      setComparisonGuestVersion(CURRENT_RESULT_VERSION);
      analytics.track('compatibility_completed', {
        hostScores: comparisonHostScores,
        guestScores: scores,
      });
      if (typeof window !== 'undefined') {
        navigateApp(`${languagePath}#${createComparisonHash(comparisonHostScores, scores, { hostVersion: comparisonHostVersion })}`, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setAppState('comparison-results');
      return;
    }

    if (typeof window !== 'undefined') {
      navigateApp(`/?${createResultSearchParams(scores, language).toString()}`, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('intro');
    setPersonalityScores(null);
    setResultVersion(CURRENT_RESULT_VERSION);
    setRecommendedGenres([]);
    setRecommendedArtistsList([]);
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    if (typeof window !== 'undefined') {
      removeBrowserStorage('session', 'music-personality-survey');
      navigateApp(languagePath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGenreExplorer = () => {
    setAppState('genre-explorer');
    navigateApp(`/?view=genre-explorer${language === 'ko' ? '' : `&lang=${language}`}`);
  };

  const handleBackToIntro = () => {
    if (goBackInApp()) return;
    setAppState('intro');
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    navigateApp(languagePath, true);
  };

  const handleCreateInvite = (scores: MUSICPersonality, version: ResultVersion = resultVersion) => {
    const invitation = createComparisonHash(scores, null, { hostVersion: version });
    setInviteMode('create');
    setComparisonHostScores(scores);
    setComparisonHostVersion(version);
    setComparisonGuestScores(null);
    setAppState('compare-invite');
    analytics.track('compatibility_invite_created', { hostScores: scores });
    navigateApp(`${languagePath}#${invitation}`, false, { mutiCreatedInvite: invitation });
  };

  const handleStartComparisonSurvey = () => {
    setSurveyFreshStart(true);
    setComparisonGuestScores(null);
    setComparisonGuestVersion(CURRENT_RESULT_VERSION);
    removeBrowserStorage('session', 'music-personality-survey');
    navigateApp(`/?view=survey${language === 'ko' ? '' : `&lang=${language}`}#${createComparisonHash(comparisonHostScores!, null, { hostVersion: comparisonHostVersion })}`);
    setAppState('survey');
  };

  const handleUseRecentForComparison = (result: RecentMusicResult) => {
    if (!comparisonHostScores) return;
    setComparisonGuestScores(result.scores);
    setComparisonGuestVersion(getRecentResultVersion(result));
    setPersonalityScores(result.scores);
    setResultVersion(getRecentResultVersion(result));
    setAppState('comparison-results');
    analytics.track('compatibility_completed', { source: 'recent-result' });
    navigateApp(`${languagePath}#${createComparisonHash(comparisonHostScores, result.scores, { hostVersion: comparisonHostVersion, guestVersion: getRecentResultVersion(result) })}`);
  };

  const handleViewComparisonResult = (participant: 'host' | 'guest') => {
    const scores = participant === 'host' ? comparisonHostScores : comparisonGuestScores;
    const version = participant === 'host' ? comparisonHostVersion : comparisonGuestVersion;
    if (!scores) return;
    setPersonalityScores(scores);
    setResultVersion(version);
    buildRecommendations(scores, genres, version);
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    setAppState('results');
    navigateApp(`/?${createResultSearchParams(scores, language, version).toString()}`);
  };

  const handleRestoreComparison = (result: RecentComparison) => {
    setComparisonHostScores(result.hostScores);
    setComparisonGuestScores(result.guestScores);
    setComparisonHostVersion(result.hostVersion);
    setComparisonGuestVersion(result.guestVersion);
    setAppState('comparison-results');
    navigateApp(`${languagePath}#${createComparisonHash(result.hostScores, result.guestScores, result)}`);
  };

  const handleInviteAnotherFriend = (participant: 'host' | 'guest') => {
    const scores = participant === 'host' ? comparisonHostScores : comparisonGuestScores;
    const version = participant === 'host' ? comparisonHostVersion : comparisonGuestVersion;
    if (!scores) return;
    setPersonalityScores(scores);
    setResultVersion(version);
    buildRecommendations(scores, genres, version);
    handleCreateInvite(scores, version);
  };

  const handleBackFromInvite = () => {
    if (goBackInApp()) return;
    if (personalityScores) {
      setComparisonHostScores(null);
      setComparisonGuestScores(null);
      buildRecommendations(personalityScores, genres, resultVersion);
      setAppState('results');
      navigateApp(`/?${createResultSearchParams(personalityScores, language, resultVersion).toString()}`, true);
      return;
    }
    handleBackToIntro();
  };

  const handleRestoreRecentResult = (result: RecentMusicResult) => {
    const storedVersion = getRecentResultVersion(result);
    setPersonalityScores(result.scores);
    setResultVersion(storedVersion);
    const recommendations = buildRecommendations(result.scores, genres, storedVersion);
    setAppState('results');
    analytics.track('recent_result_opened', { topGenreId: recommendations[0]?.genreId || result.topGenreId });
    navigateApp(`/?${createResultSearchParams(result.scores, language, storedVersion).toString()}`);
  };

  const enterSurvey = (comparisonHash: string | null = null, freshStart = false) => {
    const comparison = comparisonHash ? parseComparisonHash(comparisonHash) : null;
    setResumeChoice(null);
    setSurveyFreshStart(freshStart);
    setComparisonHostScores(comparison?.hostScores ?? null);
    setComparisonHostVersion(comparison?.hostVersion ?? CURRENT_RESULT_VERSION);
    setComparisonGuestScores(null);
    setComparisonGuestVersion(CURRENT_RESULT_VERSION);
    navigateApp(`/?view=survey${language === 'ko' ? '' : `&lang=${language}`}${comparisonHash ? `#${comparisonHash}` : ''}`);
    setAppState('survey');
  };

  const readResumeChoice = () => {
    try {
      const saved = readBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
      return saved ? resumableSurveyDraft(JSON.parse(saved), questions) : null;
    } catch {
      return null;
    }
  };

  const handleFreshSurvey = () => {
    removeBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
    enterSurvey(null, true);
  };

  const handleContinueSurvey = () => {
    const current = readResumeChoice();
    if (current) enterSurvey(current.comparisonHash);
    else handleFreshSurvey();
  };

  const handleStartSurvey = () => {
    if (resumeChoice) {
      setResumeChoice(null);
      return;
    }
    const saved = readResumeChoice();
    if (saved) setResumeChoice(saved);
    else handleFreshSurvey();
  };

  const currentGenreForRecent = (result: RecentMusicResult) => {
    const topId = recommendGenres(result.scores, genres, language, getRecentResultVersion(result))[0]?.genreId;
    return genres.find(item => item.id === topId);
  };

  const retryScreen = () => {
    // Preserve the current URL and restore a saved draft rather than starting over.
    setSurveyFreshStart(false);
    setLazyScreens(createLazyScreens());
    setScreenAttempt(attempt => attempt + 1);
  };

  const recoverToHome = () => {
    // Unlike restarting a completed test, recovering to home never deletes answers.
    setSurveyFreshStart(false);
    setLazyScreens(createLazyScreens());
    setScreenAttempt(attempt => attempt + 1);
    setResumeChoice(null);
    setComparisonHostScores(null);
    setComparisonGuestScores(null);
    setAppState('intro');
    navigateApp(languagePath, true);
  };

  const renderScreen = (children: React.ReactNode, message: string) => (
    <AppScreenBoundary key={`${appState}-${screenAttempt}`} language={language} onRetry={retryScreen} onHome={recoverToHome}>
      <Suspense fallback={<LoadingSpinner message={message} />}>{children}</Suspense>
    </AppScreenBoundary>
  );

  if (dataLoadError) return <main data-testid="data-load-recovery" className="app-canvas flex min-h-screen flex-col items-center justify-center px-5 text-center text-white"><h1 className="text-2xl font-bold">{language === 'ko' ? '데이터를 불러오지 못했어요.' : language === 'ja' ? 'テストを読み込めませんでした。' : 'We could not load the test.'}</h1><p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{language === 'ko' ? '연결을 확인한 뒤 다시 시도해 주세요.' : language === 'ja' ? '接続を確認して、もう一度お試しください。' : 'Please check your connection and try again.'}</p><button onClick={() => {
    if (dataLoadNeedsReload) window.location.reload();
    else setLoadAttempt(attempt => attempt + 1);
  }} className="primary-action mt-7">{language === 'ko' ? '다시 시도하기' : language === 'ja' ? 'もう一度' : 'Try again'}</button></main>;
  if (appState === 'intro') {
    const resumeCopy = language === 'ko'
      ? { title: '중단한 검사를 이어갈까요?', progress: '문항에 답했어요.', continue: '이어서 검사하기', fresh: '처음부터 검사하기', note: '응답은 이 탭에서만 보관돼요.', comparison: '친구와의 궁합 검사도 함께 이어집니다.', warning: '처음부터 시작하면 기존 응답을 지우고 새 개인 검사를 시작해요.' }
      : language === 'ja'
        ? { title: '途中のテストを再開しますか？', progress: '問に回答済みです。', continue: '続きから再開', fresh: '最初から始める', note: '回答はこのタブにだけ保存されます。', comparison: '友達との相性テストも続きから再開します。', warning: '最初から始めると回答を消去し、新しい個人テストを始めます。' }
        : { title: 'Continue your unfinished test?', progress: 'questions answered.', continue: 'Continue my test', fresh: 'Start from the beginning', note: 'Answers stay in this tab only.', comparison: 'Your friend comparison will continue too.', warning: 'Starting over clears these answers and begins a new personal test.' };
    const historyCopy = language === 'ko'
      ? { title: '최근 궁합 바로 보기', older: '다른 저장된 궁합', note: '최근 궁합은 최대 3개까지 이 기기에만 저장돼요. 이름은 저장하지 않으며 아래 삭제 버튼으로 지울 수 있어요.', remove: '이 궁합 삭제' }
      : language === 'ja'
        ? { title: '最近の相性を開く', older: 'ほかの保存済み相性', note: '最近の相性を3件までこの端末に保存します。名前は保存せず、削除ボタンで消せます。', remove: 'この相性を削除' }
        : { title: 'Open my last match', older: 'Other saved matches', note: 'Up to three recent matches stay on this device. Names are not stored; use the delete button to remove a match.', remove: 'Delete this match' };
    const recentComparisonRow = (result: RecentComparison, index: number) => {
      const hostId = recommendGenres(result.hostScores, genres, language, result.hostVersion)[0]?.genreId;
      const guestId = recommendGenres(result.guestScores, genres, language, result.guestVersion)[0]?.genreId;
      const hostGenre = genres.find(genre => genre.id === hostId);
      const guestGenre = genres.find(genre => genre.id === guestId);
      const score = calculatePairCompatibility(result.hostScores, result.guestScores, language).score;
      return <div key={result.id} className="flex min-w-0 items-stretch gap-2">
        <button ref={index === 0 ? latestComparisonRef : undefined} disabled={!dataLoaded} onClick={() => handleRestoreComparison(result)} className="ui-interactive-card min-h-14 min-w-0 flex-1 rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-left backdrop-blur-xl hover:bg-white/10">
          <span className="block text-xs font-semibold text-white/70">{index === 0 ? historyCopy.title : `#${index + 1}`} · {score}%</span>
          <span className="mt-1 block break-words text-sm font-bold">{hostGenre ? getGenreName(hostGenre, language) : 'MUSIC'} × {guestGenre ? getGenreName(guestGenre, language) : 'MUSIC'}</span>
        </button>
        <button aria-label={`${historyCopy.remove} ${index + 1}`} onClick={() => handleDeleteHistory('comparison', result.id)} className="ui-icon-button self-center text-lg">×</button>
      </div>;
    };
    const latestGenre = recentResults[0] ? currentGenreForRecent(recentResults[0]) : undefined;
    const copy = language === 'ko' ? {
      eyebrow: 'MUTI · MUSIC TASTE IDENTITY',
      headline: '취향을 들으면,\n당신이 보입니다.',
      body: '좋아하는 음악에 답하고 나와 닮은 장르와 음악 성격을 발견해보세요.',
      cta: '내 음악 성격 찾기',
      explore: '장르별 성향 먼저 보기',
      note: '재미로 즐기는 음악 취향 테스트예요.',
      recent: '최근 결과 바로 보기',
      older: '다른 저장된 결과',
      remove: '이 검사 결과 삭제',
      historyNote: '최근 결과 3개는 이 브라우저에만 저장돼요. 삭제 버튼으로 개별 결과를 지울 수 있어요.',
    } : language === 'ja' ? {
      eyebrow: 'MUTI · MUSIC TASTE IDENTITY',
      headline: '好きな音を辿れば、\nあなたが見える。',
      body: '40の質問に答えて、あなたに似たジャンルと音楽性格を見つけましょう。',
      cta: '私の音楽性格を見つける',
      explore: 'ジャンルの性格を見る',
      note: '音楽心理学に着想を得た、気軽に楽しむテストです。',
      recent: '最近の結果を見る',
      older: 'ほかの保存済み結果',
      remove: 'このテスト結果を削除',
      historyNote: '最近の結果を3件までこのブラウザーに保存します。削除ボタンで個別に消せます。',
    } : {
      eyebrow: 'MUTI · MUSIC TASTE IDENTITY',
      headline: 'Your taste says\nmore than words.',
      body: 'Answer 40 quick questions and discover the genres that sound most like you.',
      cta: 'Find my music type',
      explore: 'Browse genre personalities',
      note: 'A lighthearted test inspired by music psychology.',
      recent: 'View my last result',
      older: 'Other saved results',
      remove: 'Delete this test result',
      historyNote: 'Up to three recent results stay in this browser. Delete individual results with the remove button.',
    };

    return (
      <main className="app-canvas text-white">
        <DotMatrixBackground />
        <div className="intro-matrix-fade pointer-events-none absolute inset-0" aria-hidden="true" />

        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xl font-extrabold tracking-[-0.04em]">MUTI</p>
            <p className="mt-1 text-[9px] font-semibold leading-[1.5] tracking-[0.16em] text-white/60 min-[360px]:text-[10px] min-[360px]:tracking-[0.18em]">
              <span className="block whitespace-nowrap">MUSIC TASTE IDENTITY</span>
              <span className="block">BY CHAMELEONS</span>
            </p>
          </div>
          <LanguageSelector />
        </header>

        <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center px-5 pb-16 pt-36 text-center sm:px-8 sm:pb-20 sm:pt-40">
          <div className="mx-auto w-full max-w-5xl fade-in">
            <p className="eyebrow mb-6 !text-white/70">{copy.eyebrow}</p>
            <h1 className={`${language === 'ja' ? 'text-[clamp(2rem,8.8vw,5.8rem)] font-extrabold leading-[1.08] tracking-[-0.055em]' : language === 'ko' ? 'text-[clamp(3.15rem,7.2vw,6.6rem)] font-extrabold leading-[0.92] tracking-[-0.07em]' : 'display-title'} whitespace-pre-line text-balance drop-shadow-[0_18px_60px_rgba(0,0,0,.65)]`}>
              {copy.headline.split('\n').map((line, index) => (
                <React.Fragment key={line}>
                  {index === 1 ? <span className="text-gradient">{line}</span> : line}
                  {index === 0 && <br />}
                </React.Fragment>
              ))}
            </h1>
            <p className="mx-auto mt-7 max-w-lg text-base leading-7 text-white/80 sm:text-lg sm:leading-8">{copy.body}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button ref={startSurveyRef} onClick={handleStartSurvey} disabled={!dataLoaded} aria-expanded={Boolean(resumeChoice)} aria-controls={resumeChoice ? 'survey-resume-choice' : undefined} className={`${resumeChoice ? 'secondary-action' : 'primary-action'} group inline-flex items-center justify-center gap-3 sm:min-w-56`}>
                {copy.cta}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={handleOpenGenreExplorer} disabled={!dataLoaded} className="secondary-action group inline-flex items-center justify-center gap-2">
                <Compass size={17} />
                {copy.explore}
              </button>
            </div>

            {resumeChoice && <section id="survey-resume-choice" data-testid="survey-resume-choice" aria-labelledby="survey-resume-title" className="ui-panel mx-auto mt-5 max-w-lg p-5 text-left sm:p-6" onKeyDown={event => {
              if (event.key === 'Escape') {
                setResumeChoice(null);
                startSurveyRef.current?.focus();
              }
            }}>
              <h2 ref={resumeHeadingRef} id="survey-resume-title" tabIndex={-1} className="text-lg font-bold leading-7 focus-visible:!outline-none">{resumeCopy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/75"><span className="score-tabular font-bold text-white">{surveyAnswerProgress(questions, resumeChoice.answers).answeredCount} / {questions.length}</span> {resumeCopy.progress}</p>
              {resumeChoice.comparisonHash && <p className="mt-1 text-sm leading-6 text-white/75">{resumeCopy.comparison}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button onClick={handleContinueSurvey} className="primary-action inline-flex items-center justify-center gap-2 sm:flex-1">{resumeCopy.continue}<ArrowRight size={16} aria-hidden="true" /></button>
                <button onClick={handleFreshSurvey} className="secondary-action sm:flex-1">{resumeCopy.fresh}</button>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/60">{resumeCopy.warning}<br />{resumeCopy.note}</p>
            </section>}

            <div className="intro-facts mt-7 text-xs">
              <span className="inline-flex items-center gap-2"><Layers3 size={14} />40 {language === 'ko' ? '문항' : language === 'ja' ? '問' : 'questions'}</span>
              <span className="inline-flex items-center gap-2"><Clock3 size={14} />{language === 'ko' ? '약 5분' : language === 'ja' ? '約5分' : 'about 5 min'}</span>
              <span className="inline-flex items-center gap-2"><Sparkles size={14} />{genres.length || '—'} {language === 'ko' ? '개 장르' : language === 'ja' ? 'ジャンル' : 'genres'}</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/70">{copy.note}</p>
            {recentResults.length > 0 && (
              <div className="mx-auto mt-7 max-w-sm text-left">
                <div className="flex min-w-0 items-stretch gap-2">
                  <button ref={latestPersonalRef} data-testid="recent-personal-result" disabled={!dataLoaded} onClick={() => handleRestoreRecentResult(recentResults[0])} className="ui-interactive-card flex min-h-16 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-left backdrop-blur-xl hover:border-white/40 hover:bg-white/10">
                    <span><span className="block text-xs font-semibold text-white/70">{copy.recent}</span><span className="mt-1 block text-base font-bold text-white">{latestGenre ? getGenreName(latestGenre, language) : copy.recent}</span></span>
                    <ArrowRight size={17} className="shrink-0 text-white/70" />
                  </button>
                  <button aria-label={`${copy.remove} 1`} onClick={() => handleDeleteHistory('personal', recentResults[0].id)} className="ui-icon-button self-center text-lg">×</button>
                </div>
                {recentResults.length > 1 && <details className="mt-3">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-xl px-3 text-center text-sm font-semibold text-white/75 transition-colors hover:bg-white/5 hover:text-white">{copy.older} ({recentResults.length - 1}) ↓</summary>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl">
                  {recentResults.slice(1).map((result, index) => {
                    const genre = currentGenreForRecent(result);
                    return (
                      <div key={result.id} className="flex min-w-0 items-stretch gap-2">
                        <button disabled={!dataLoaded} onClick={() => handleRestoreRecentResult(result)} className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-3 text-left text-xs text-white/55 transition-colors hover:bg-white/8 hover:text-white">
                          <span>{genre ? getGenreName(genre, language) : (language === 'ko' ? '음악 성격 결과' : language === 'ja' ? '音楽性格の結果' : 'Music personality result')}</span>
                          <span className="score-tabular text-[10px] text-white/25">#{index + 2}</span>
                        </button>
                        <button aria-label={`${copy.remove} ${index + 2}`} onClick={() => handleDeleteHistory('personal', result.id)} className="ui-icon-button self-center text-lg">×</button>
                      </div>
                    );
                  })}
                  </div>
                </details>}
                <p className="mt-3 text-xs leading-5 text-white/60">{copy.historyNote}</p>
              </div>
            )}
            {recentComparisons.length > 0 && <section data-testid="recent-comparisons" className="mx-auto mt-6 max-w-sm space-y-3 text-left">
              {recentComparisonRow(recentComparisons[0], 0)}
              {recentComparisons.length > 1 && <details><summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-xl px-3 text-center text-sm font-semibold text-white/75 transition-colors hover:bg-white/5 hover:text-white">{historyCopy.older} ({recentComparisons.length - 1}) ↓</summary><div className="mt-2 space-y-3">{recentComparisons.slice(1).map((item, index) => recentComparisonRow(item, index + 1))}</div></details>}
              <p className="text-xs leading-5 text-white/60">{historyCopy.note}</p>
            </section>}
            <p role="status" aria-atomic="true" data-testid="history-delete-status" className={`mx-auto max-w-sm text-xs leading-5 ${historyDeletion ? 'mt-4' : ''} ${historyDeletion === 'failed' ? 'text-[#ffc3b4]' : 'text-white/65'}`}>
              {historyDeletion && (language === 'ko' ? (historyDeletion === 'failed' ? '저장된 결과를 삭제하지 못했어요. 브라우저 저장 설정을 확인하고 다시 시도해 주세요.' : '이 브라우저에서 저장된 결과를 삭제했어요.') : language === 'ja' ? (historyDeletion === 'failed' ? '保存した結果を削除できませんでした。ブラウザーの保存設定を確認して再試行してください。' : 'このブラウザーの保存済み結果を削除しました。') : (historyDeletion === 'failed' ? 'Could not delete the saved result. Check your browser storage settings and try again.' : 'The saved result was deleted from this browser.'))}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!dataLoaded) return <LoadingSpinner message={t('common.loading.initializing')} />;

  if (appState === 'survey') {
    return renderScreen(<Survey questions={questions} freshStart={surveyFreshStart} comparisonHash={comparisonHostScores ? createComparisonHash(comparisonHostScores, null, { hostVersion: comparisonHostVersion }) : null} onComplete={handleSurveyComplete} onGoHome={handleBackToIntro} />, t('common.loading.preparingSurvey'));
  }

  if (appState === 'results' && personalityScores) {
    const saveFailed = failedPersonalSaveKey === createResultSearchParams(personalityScores, 'ko', resultVersion).toString();
    return renderScreen(<>
        {saveFailed && <HistorySaveNotice key={failedPersonalSaveKey} language={language} resultUrl={getResultUrl(personalityScores, language, resultVersion)} />}
        <PersonalityResults
          personalityScores={personalityScores}
          recommendedGenres={recommendedGenres}
          genres={genres}
          recommendedArtists={recommendedArtistsList}
          resultVersion={resultVersion}
          onRestart={handleRestart}
          onInviteFriend={() => handleCreateInvite(personalityScores)}
        />
      </>, t('common.loading.analyzingResults'));
  }

  if (appState === 'compare-invite' && comparisonHostScores) {
    return renderScreen(
        <CompatibilityInvite
          mode={inviteMode}
          hostScores={comparisonHostScores}
          hostVersion={comparisonHostVersion}
          genres={genres}
          recentResults={recentResults}
          onStartSurvey={handleStartComparisonSurvey}
          onUseRecent={handleUseRecentForComparison}
          onBack={handleBackFromInvite}
        />
      , t('common.loading.initializing'));
  }

  if (appState === 'comparison-results' && comparisonHostScores && comparisonGuestScores) {
    const comparisonKey = createComparisonHash(comparisonHostScores, comparisonGuestScores, { hostVersion: comparisonHostVersion, guestVersion: comparisonGuestVersion });
    return renderScreen(<>
        {failedComparisonSaveKey === comparisonKey && <HistorySaveNotice key={comparisonKey} language={language} resultUrl={getComparisonUrl(comparisonHostScores, comparisonGuestScores, language, { hostVersion: comparisonHostVersion, guestVersion: comparisonGuestVersion })} />}
        <CompatibilityResults
          hostScores={comparisonHostScores}
          guestScores={comparisonGuestScores}
          hostVersion={comparisonHostVersion}
          guestVersion={comparisonGuestVersion}
          genres={genres}
          musicCatalog={musicCatalog}
          onViewResult={handleViewComparisonResult}
          onCreateInvite={handleInviteAnotherFriend}
          onRestart={handleRestart}
        />
      </>, t('common.loading.analyzingResults'));
  }

  if (appState === 'genre-explorer') {
    return renderScreen(
      <main className="genre-explorer-canvas relative isolate min-h-[100dvh] overflow-x-hidden bg-[#07080a] text-white">
        <DotMatrixBackground style={{ position: 'fixed' }} />
        <div className="intro-matrix-fade pointer-events-none fixed inset-0" aria-hidden="true" />
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#07080a]/90 px-5 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button onClick={handleBackToIntro} className="inline-flex min-h-11 items-center text-sm font-semibold text-white/75 transition-colors hover:text-white">← {t('common.buttons.backToHome')}</button>
            <LanguageSelector />
          </div>
        </div>
        <GenreExplorer genres={genres} musicCatalog={musicCatalog} />
      </main>
    , t('common.loading.loadingGenres'));
  }

  return <LoadingSpinner message={t('common.errorOccurred')} />;
};

export default MusicPersonalityApp;
