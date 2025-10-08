'use client';

import React, { useState, lazy } from 'react';
import { ExternalLink } from 'lucide-react';
import { MUSICPersonality, EnhancedRecommendationScore, GenreSchema, RecommendedArtist } from '@/types';
import { generateEnhancedRelationshipCompatibility, getCompatiblePersonalityTypes } from '@/lib/musicCalculations';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateYouTubeSearchUrl, openYouTubeLink, getEnglishArtistName } from '@/lib/youtube';
import { getGenreDescription, getGenreCharacteristics } from '@/lib/genreTranslations';
import { analytics } from '@/lib/analytics';
import PersonalityAnalysisReport from './PersonalityAnalysisReport';
import AnimatedSection from './ui/AnimatedSection';

// Lazy load heavy components
const MUSICRadarChart = lazy(() => import('./ui/charts/MUSICRadarChart'));

interface PersonalityResultsProps {
  personalityScores: MUSICPersonality;
  recommendedGenres: EnhancedRecommendationScore[];
  genres: GenreSchema[];
  recommendedArtists?: RecommendedArtist[];
}

const PersonalityResults: React.FC<PersonalityResultsProps> = ({
  personalityScores,
  recommendedGenres,
  genres,
  recommendedArtists = []
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // 최고 추천 장르 찾기 및 안전성 검사
  const topGenre = recommendedGenres[0];
  const topGenreData = genres.find(g => g.id === topGenre?.genreId);
  
  // 폴백 시스템: 기본 성격 분석이 없는 경우 대체 데이터 생성
  const createFallbackAnalysis = () => {
    if (!topGenreData) return null;

    const genreDescription = getGenreDescription(topGenreData.id, topGenreData.description, language);
    const genreCharacteristics = getGenreCharacteristics(topGenreData.id, topGenreData.characteristics, language);
    
    return {
      typeTitle: language === 'en' 
        ? `${topGenreData.name} Music Enthusiast`
        : `${topGenreData.nameKo} 성향의 음악 애호가`,
      description: language === 'en'
        ? `You have a unique taste for ${topGenreData.name} music. ${genreDescription}`
        : `당신은 ${topGenreData.nameKo} 음악을 선호하는 독특한 취향을 가지고 있습니다. ${genreDescription}`,
      coreTraits: [
        {
          traitName: language === 'en' ? "Musical Openness" : "음악적 개방성",
          score: 80,
          description: language === 'en'
            ? `You have an open mind that enjoys music like ${topGenreData.name}.`
            : `${topGenreData.nameKo}와 같은 음악을 즐기는 열린 마음을 가지고 있습니다.`,
          impact: language === 'en'
            ? "Strong exploratory spirit for various music genres."
            : "다양한 음악 장르에 대한 탐구 정신이 강합니다."
        },
        {
          traitName: language === 'en' ? "Emotional Expression" : "감정 표현력",
          score: 75,
          description: language === 'en'
            ? "You enjoy expressing your emotions through music."
            : "음악을 통해 자신의 감정을 표현하는 것을 좋아합니다.",
          impact: language === 'en'
            ? "Music is an important means of emotional communication."
            : "음악이 감정적 소통의 중요한 수단입니다."
        },
        {
          traitName: language === 'en' ? "Creative Thinking" : "창의적 사고",
          score: 85,
          description: language === 'en'
            ? "You show creative and original aspects in your musical taste."
            : "음악적 취향에서 창의적이고 독창적인 면모를 보입니다.",
          impact: language === 'en'
            ? "Excellent artistic sense and creativity."
            : "예술적 감각과 창의성이 뛰어납니다."
        }
      ],
      lifestyleInsights: language === 'en' ? [
        `You relieve daily stress through ${topGenreData.name} music.`,
        "You value your personal time through music appreciation.",
        "Musical taste has a significant impact on your lifestyle."
      ] : [
        `${topGenreData.nameKo} 음악을 통해 일상의 스트레스를 해소합니다.`,
        "음악 감상을 통해 자신만의 시간을 소중히 여깁니다.",
        "음악적 취향이 라이프스타일에 큰 영향을 미칩니다."
      ],
      strengths: language === 'en' ? [
        "Unique and distinctive musical taste",
        "Artistic sensitivity and creative thinking",
        "Ability to regulate emotions through music"
      ] : [
        "독특하고 개성 있는 음악적 취향",
        "예술적 감수성과 창의적 사고력",
        "음악을 통한 감정 조절 능력"
      ],
      challenges: language === 'en' ? [
        "Sometimes feeling isolated due to non-mainstream taste",
        "Musical perfectionist tendencies",
        "Fear of exploring new genres"
      ] : [
        "때로는 대중적이지 않은 취향으로 인한 소외감",
        "음악적 완벽주의 성향",
        "새로운 장르 탐험에 대한 두려움"
      ],
      relationshipCompatibility: generateEnhancedRelationshipCompatibility(personalityScores, genres),
      musicPreferences: language === 'en' ? [
        `Deeply captivated by the special charm of ${topGenreData.name}.`,
        ...genreCharacteristics.map(char => `You value ${char} musical elements.`)
      ] : [
        `${topGenreData.nameKo}의 특별한 매력에 깊이 빠져있습니다.`,
        ...genreCharacteristics.map(char => `${char}한 음악적 요소를 중요하게 생각합니다.`)
      ],
      recommendedActivities: language === 'en' ? [
        `Attend ${topGenreData.name} concerts or festivals`,
        "Participate in music-related community activities",
        "Discover new artists and curate music",
        "Try music production or performance"
      ] : [
        `${topGenreData.nameKo} 콘서트나 페스티벌 참가`,
        "음악 관련 커뮤니티 활동",
        "새로운 아티스트 발굴 및 음악 큐레이션",
        "음악 제작이나 연주 도전"
      ]
    };
  };
  
  // 실제 분석 데이터 또는 폴백 데이터 결정
  const personalityAnalysis = topGenre?.personalityAnalysis || createFallbackAnalysis();
  
  // 호환되는 성격 유형들 계산
  const compatibleTypes = getCompatiblePersonalityTypes(personalityScores, genres);

  return (
    <div className="personality-results min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* 메인 결과 */}
        <AnimatedSection delay={0} direction="fade" className="text-center mb-12">
          <div className="text-8xl mb-6">🎵</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('results.title')}
          </h1>
          
          {topGenreData ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">
                {language === 'en' 
                  ? `You are a ${topGenreData.name} enthusiast from ${topGenreData.category}!`
                  : `당신은 ${topGenreData.category}의 ${topGenreData.nameKo} 입니다!`
                }
              </h2>
               <p className="text-lg text-gray-700 mb-4">
                 {getGenreDescription(topGenreData.id, topGenreData.description, language)}
               </p>
               <div className="flex flex-wrap justify-center gap-2">
                 {getGenreCharacteristics(topGenreData.id, topGenreData.characteristics, language)?.map((trait, index) => (
                   <span
                     key={index}
                     className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                   >
                     {trait}
                   </span>
                 )) || []}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                {t('results.fallbackTitle')}
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                {t('results.fallbackDescription')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {t('results.uniqueTaste')}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {t('results.distinctive')}
                </span>
              </div>
            </div>
          )}
        </AnimatedSection>

        {/* MUSIC 점수 상세 */}
        <AnimatedSection delay={0.3} direction="up" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('results.musicProfileTitle')}</h3>
          
          <MUSICRadarChart 
            personalityScores={personalityScores}
            animated={true}
            showTooltip={true}
            size="md"
          />
        </AnimatedSection>

        {/* 추천 장르들 */}
        <AnimatedSection delay={0.6} direction="up" className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t('results.recommendedGenres')}</h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedGenres.slice(0, 6).map((rec, index) => {
              const genre = genres.find(g => g.id === rec.genreId);
              
              // 안전성 검사: 장르 데이터가 없는 경우 기본값 제공
              if (!genre) {
                return (
                  <div key={rec.genreId} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-600">{t('results.unknownGenre')}</h4>
                      <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {rec.compatibility}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{t('results.cannotLoadGenre')}</p>
                  </div>
                );
              }

              return (
                <div
                  key={rec.genreId}
                  className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    index === 0 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{language === 'en' ? genre.name : genre.nameKo}</h4>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rec.compatibility}%
                    </span>
                  </div>
                  
                   <p className="text-sm text-gray-600 mb-2">{getGenreDescription(genre.id, genre.description, language)}</p>
                   
                   <div className="flex flex-wrap gap-1">
                     {getGenreCharacteristics(genre.id, genre.characteristics, language).slice(0, 3).map((trait, traitIndex) => (
                       <span
                         key={traitIndex}
                         className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                       >
                         {trait}
                       </span>
                     ))}
                  </div>

                  {rec.reasoning.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">{t('results.recommendationReason')}</summary>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {rec.reasoning.slice(0, 2).map((reason, reasonIndex) => (
                          <li key={reasonIndex}>• {reason}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* 추천 아티스트들 */}
        {recommendedArtists.length > 0 && (
          <AnimatedSection delay={0.9} direction="up" className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('results.recommendedArtists')}</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedArtists.map((rec, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    index === 0 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{language === 'en' ? rec.artist.name : rec.artist.nameKo}</h4>
                      <p className="text-sm text-gray-600">{language === 'en' ? rec.artist.nameKo : rec.artist.name}</p>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      index === 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rec.compatibility}%
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">{language === 'en' ? `${rec.genreName} genre` : `${rec.genreNameKo} 장르`}</p>
                  
                   <div className="mb-2">
                     <p className="text-xs font-medium text-gray-700 mb-1">{t('results.keyTracks')}:</p>
                     <div className="flex flex-wrap gap-1">
                       {rec.artist.keyTracks.slice(0, 2).map((track: string, trackIndex: number) => {
                         const englishArtistName = getEnglishArtistName(rec.artist.nameKo || rec.artist.name);
                         const youtubeUrl = generateYouTubeSearchUrl(englishArtistName, track);
                         
                         return (
                           <button
                             key={trackIndex}
                             onClick={() => {
                               // Analytics tracking
                               analytics.track('youtube_track_click', {
                                 artist: rec.artist.name,
                                 track: track,
                                 genre: rec.genreName,
                                 compatibility: rec.compatibility
                               });
                               openYouTubeLink(youtubeUrl, track);
                             }}
                             className="inline-flex items-center text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 active:bg-red-200 transition-colors border border-red-200 hover:border-red-300"
                             title={`${t('results.clickToListen')} "${track}"`}
                           >
                             <span>{track}</span>
                             <ExternalLink size={10} className="ml-1 opacity-70" />
                           </button>
                         );
                       })}
                     </div>
                   </div>

                  <details className="mt-2">
                    <summary className="text-xs text-purple-600 cursor-pointer">{t('results.recommendationReason')}</summary>
                    <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                  </details>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* 상세 성격 분석 버튼 - 폴백 시스템 적용 */}
        {personalityAnalysis && (
          <AnimatedSection delay={1.2} direction="fade" className="text-center mt-8">
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all mr-4"
            >
              {showDetailedAnalysis ? t('results.showSimpleResults') : t('results.showDetailedAnalysis')}
            </button>
            
            {/* 폴백 데이터 사용 시 알림 */}
            {!topGenre?.personalityAnalysis && personalityAnalysis && (
              <p className="text-sm text-gray-500 mt-2">
                * {t('results.fallbackAnalysisNote')}
              </p>
            )}
          </AnimatedSection>
        )}

        {/* 상세 성격 분석 리포트 - 폴백 시스템 적용 */}
        {showDetailedAnalysis && personalityAnalysis && (
          <div className="mt-8">
            <PersonalityAnalysisReport 
              analysis={personalityAnalysis} 
              compatibleTypes={compatibleTypes}
            />
          </div>
        )}

        {/* 행동 버튼들 */}
        <AnimatedSection delay={1.5} direction="up" className="text-center mt-8 space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
            >
              {t('results.retakeTest')}
            </button>
            
            <button
              onClick={() => window.location.href = '/?view=genre-explorer'}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
            >
              {t('results.exploreGenres')}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>{t('results.musicModelNote')}</p>
          </div>
        </AnimatedSection>


      </div>
    </div>
  );
};

export default PersonalityResults;