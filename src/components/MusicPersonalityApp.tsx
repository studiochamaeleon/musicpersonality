'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Question, GenreSchema, MUSICPersonality, EnhancedRecommendationScore, RecommendedArtist } from '@/types';
import { calculateMUSICScores, recommendGenres, recommendArtists } from '@/lib/musicCalculations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { analytics } from '@/lib/analytics';

// Lazy load heavy components
const Survey = lazy(() => import('@/components/Survey'));
const PersonalityResults = lazy(() => import('@/components/PersonalityResults'));
const GenreExplorer = lazy(() => import('@/components/GenreExplorer'));

// 데이터는 동적으로 로드

type AppState = 'intro' | 'survey' | 'results' | 'genre-explorer';

const MusicPersonalityApp: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [appState, setAppState] = useState<AppState>('intro');
  const [personalityScores, setPersonalityScores] = useState<MUSICPersonality | null>(null);
  const [recommendedGenres, setRecommendedGenres] = useState<EnhancedRecommendationScore[]>([]);
  const [recommendedArtistsList, setRecommendedArtistsList] = useState<RecommendedArtist[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [genres, setGenres] = useState<GenreSchema[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 데이터 로딩
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsModule, genresModule] = await Promise.all([
          import('@/data/questions.json'),
          import('@/data/genres.json')
        ]);
        
        setQuestions(questionsModule.default as Question[]);
        setGenres(genresModule.default as GenreSchema[]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSurveyComplete = (answers: Record<string, number>) => {
    // MUSIC 점수 계산
    const scores = calculateMUSICScores(questions, answers);
    setPersonalityScores(scores);

    // 장르 추천
    const recommendations = recommendGenres(scores, genres);
    setRecommendedGenres(recommendations);

    // 아티스트 추천
    const artists = recommendArtists(recommendations, genres, 6, language);
    setRecommendedArtistsList(artists);

    // 분석 추적
    const topGenreId = recommendations[0]?.genreId;
    const topGenre = topGenreId ? genres.find(g => g.id === topGenreId) : null;
    
    analytics.track('survey_completed', {
      personalityScores: scores,
      topGenre: topGenre?.name || 'Unknown',
      recommendedGenresCount: recommendations.length,
      completionTime: Date.now()
    });

    // 결과 화면으로 이동
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('intro');
    setPersonalityScores(null);
    setRecommendedGenres([]);
    setRecommendedArtistsList([]);
  };

  // 데이터 로딩 중
  if (!dataLoaded) {
    return <LoadingSpinner message={t('common.loading.initializing')} />;
  }

  // 인트로 화면
  if (appState === 'intro') {
    return (
      <div className="intro-screen min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center relative">
        {/* Language Selector - responsive positioning */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <LanguageSelector />
        </div>
        
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <div className="text-8xl mb-8">🎵</div>
          
          <h1 className="text-5xl font-bold mb-6">
            {t('intro.title')}
          </h1>
          
          <p className="text-xl mb-8 opacity-90">
            {t('intro.description')}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('intro.musicModelTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium">{t('intro.musicModelTraits.mellow.name')}</div>
                <div className="text-xs opacity-80">{t('intro.musicModelTraits.mellow.description')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium">{t('intro.musicModelTraits.unpretentious.name')}</div>
                <div className="text-xs opacity-80">{t('intro.musicModelTraits.unpretentious.description')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium">{t('intro.musicModelTraits.sophisticated.name')}</div>
                <div className="text-xs opacity-80">{t('intro.musicModelTraits.sophisticated.description')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium">{t('intro.musicModelTraits.intense.name')}</div>
                <div className="text-xs opacity-80">{t('intro.musicModelTraits.intense.description')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium">{t('intro.musicModelTraits.contemporary.name')}</div>
                <div className="text-xs opacity-80">{t('intro.musicModelTraits.contemporary.description')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setAppState('survey')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                {t('intro.startTest')}
              </button>
              
              <button
                onClick={() => setAppState('genre-explorer')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
              >
                {t('intro.exploreGenres')}
              </button>
            </div>
            
            <div className="text-sm opacity-80">
              <p>{t('intro.testInfo')}</p>
            </div>
          </div>
        </div>
        <PWAInstallPrompt />
      </div>
    );
  }

  // 설문 화면
  if (appState === 'survey') {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.preparingSurvey')} />}>
        <Survey
          questions={questions}
          onComplete={handleSurveyComplete}
          onGoHome={() => setAppState('intro')}
        />
      </Suspense>
    );
  }

  // 결과 화면
  if (appState === 'results' && personalityScores) {
    return (
      <Suspense fallback={<LoadingSpinner message={t('common.loading.analyzingResults')} />}>
        <PersonalityResults
          personalityScores={personalityScores}
          recommendedGenres={recommendedGenres}
          genres={genres}
          recommendedArtists={recommendedArtistsList}
        />
      </Suspense>
    );
  }

  // 장르 탐험 화면
  if (appState === 'genre-explorer') {
    return (
      <div>
        {/* 네비게이션 바 */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <button
              onClick={() => setAppState('intro')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {t('common.buttons.backToHome')}
            </button>
          </div>
        </div>
        
        <Suspense fallback={<LoadingSpinner message={t('common.loading.loadingGenres')} />}>
          <GenreExplorer
            genres={genres}
            onGenreSelect={() => {
              // Genre selection is now handled by the GenreExplorer modal
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="error-screen min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">{t('common.errorOccurred')}</p>
        <button
          onClick={handleRestart}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('common.restart')}
        </button>
      </div>
      <PWAInstallPrompt />
    </div>
  );
};

export default MusicPersonalityApp;