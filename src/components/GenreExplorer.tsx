'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Music, Star, TrendingUp, X, User, Calendar, Activity, Brain, User2, Lightbulb, Target, AlertTriangle, ExternalLink } from 'lucide-react';
import { GenreSchema } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEnglishArtistName } from '@/lib/youtube';
import { getGenreDescription, getGenreCharacteristics, getPersonalityAnalysis } from '@/lib/genreTranslations';
import AnimatedSection from './ui/AnimatedSection';
import MUSICRadarChart from './ui/charts/MUSICRadarChart';
import { analytics } from '@/lib/analytics';
import { generateYouTubeSearchUrl, openYouTubeLink } from '@/lib/youtube';

interface GenreExplorerProps {
  genres: GenreSchema[];
  onGenreSelect?: (genre: GenreSchema) => void;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ genres, onGenreSelect }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'energy' | 'era'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<GenreSchema | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(genres.map(g => g.category))];
    return cats;
  }, [genres]);

  // 필터링 및 정렬된 장르 목록
  const filteredAndSortedGenres = useMemo(() => {
    const filtered = genres.filter(genre => {
      const genreName = language === 'ko' ? genre.nameKo : genre.name;
      const matchesSearch = 
        genreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        genre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        genre.characteristics.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || genre.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const aName = language === 'ko' ? a.nameKo : a.name;
          const bName = language === 'ko' ? b.nameKo : b.name;
          return aName.localeCompare(bName);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'energy':
          return (b.energy || 0) - (a.energy || 0);
        case 'era':
          return (a.era || '').localeCompare(b.era || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [genres, searchTerm, selectedCategory, sortBy, language]);

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'bg-red-500';
    if (energy >= 60) return 'bg-orange-500';
    if (energy >= 40) return 'bg-yellow-500';
    if (energy >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getPopularityStars = (popularity: number) => {
    const stars = Math.round(popularity / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const handleGenreClick = (genre: GenreSchema) => {
    setSelectedGenre(genre);
    setIsModalOpen(true);
    // Track genre view
    analytics.track('genre_viewed', {
      genreName: genre.name,
      genreKo: genre.nameKo,
      category: genre.category,
      popularity: genre.popularity,
      energy: genre.energy
    });
    onGenreSelect?.(genre);
  };

  const GenreDetailModal: React.FC = () => {
    if (!selectedGenre || !isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ko' ? selectedGenre.nameKo : selectedGenre.name}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'ko' ? selectedGenre.name : selectedGenre.nameKo}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Category and Era */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {selectedGenre.category}
              </span>
              {selectedGenre.era && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {selectedGenre.era}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('genreExplorer.genreModal.description')}</h3>
              <p className="text-gray-700 leading-relaxed">{getGenreDescription(selectedGenre.id, selectedGenre.description, language)}</p>
            </div>

            {/* MUSIC 성격 지표 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Brain size={20} className="mr-2 text-purple-600" />
                {t('genreExplorer.genreModal.personalityProfile')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MUSICRadarChart 
                  personalityScores={selectedGenre.personalityProfile}
                  animated={false}
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('genreExplorer.metrics.characteristics')}</h3>
              <div className="flex flex-wrap gap-2">
                {getGenreCharacteristics(selectedGenre.id, selectedGenre.characteristics, language).map((trait, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* 성격 유형 분석 */}
            {selectedGenre.personalityAnalysis && (() => {
              const analysis = getPersonalityAnalysis(selectedGenre.id, selectedGenre.personalityAnalysis, language);
              return (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User2 size={20} className="mr-2 text-blue-600" />
                    {t('genreExplorer.genreModal.personalityAnalysis')}
                  </h3>
                  <div className="space-y-4">
                    {/* 유형 제목 및 설명 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-xl font-bold text-blue-900 mb-2">
                        {analysis.typeTitle}
                      </h4>
                      <p className="text-blue-800 leading-relaxed">
                        {analysis.description}
                      </p>
                    </div>

                    {/* 핵심 특성 */}
                    {analysis.coreTraits && analysis.coreTraits.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Target size={16} className="mr-2 text-green-600" />
                          {t('genreExplorer.genreModal.coreTraits')}
                        </h5>
                        <div className="grid gap-3">
                          {analysis.coreTraits.map((trait: { traitName: string; score: number; description: string; impact: string }, i: number) => (
                            <div key={i} className="bg-white border border-gray-200 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h6 className="font-medium text-gray-900">{trait.traitName}</h6>
                                <span className="text-sm font-bold text-green-600">{trait.score}{language === 'ko' ? '점' : ' pts'}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{trait.description}</p>
                              <p className="text-xs text-gray-500">{trait.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                   {/* 라이프스타일 통찰 */}
                   {analysis.lifestyleInsights && analysis.lifestyleInsights.length > 0 && (
                     <div>
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         <Lightbulb size={16} className="mr-2 text-yellow-600" />
                         {t('genreExplorer.genreModal.lifestyleInsights')}
                       </h5>
                       <ul className="space-y-2">
                         {analysis.lifestyleInsights.map((insight: string, i: number) => (
                           <li key={i} className="flex items-start">
                             <span className="text-yellow-500 mr-2">•</span>
                             <span className="text-gray-700 text-sm">{insight}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {/* 강점 */}
                   {analysis.strengths && analysis.strengths.length > 0 && (
                     <div>
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         <Star size={16} className="mr-2 text-purple-600" />
                         {t('genreExplorer.genreModal.strengths')}
                       </h5>
                       <div className="flex flex-wrap gap-2">
                         {analysis.strengths.map((strength: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                             {strength}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* 도전 과제 (있다면) */}
                   {analysis.challenges && analysis.challenges.length > 0 && (
                     <div>
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         <AlertTriangle size={16} className="mr-2 text-orange-600" />
                         {t('genreExplorer.genreModal.challenges')}
                       </h5>
                       <div className="flex flex-wrap gap-2">
                         {analysis.challenges.map((challenge: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                             {challenge}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                  </div>
                </div>
              );
            })()}

            {/* Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('genreExplorer.genreModal.musicalCharacteristics')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Popularity */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('genreExplorer.metrics.popularity')}</span>
                    <span className="text-sm text-gray-600">{selectedGenre.popularity}%</span>
                  </div>
                  <div className="flex space-x-0.5">
                    {getPopularityStars(selectedGenre.popularity || 0)}
                  </div>
                </div>

                {/* Energy */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('genreExplorer.metrics.energy')}</span>
                    <span className="text-sm text-gray-600">{selectedGenre.energy}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${getEnergyColor(selectedGenre.energy || 0)}`}></div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getEnergyColor(selectedGenre.energy || 0)}`}
                        style={{ width: `${selectedGenre.energy || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Valence */}
                {selectedGenre.valence !== undefined && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{t('genreExplorer.metrics.valence')}</span>
                      <span className="text-sm text-gray-600">{selectedGenre.valence}%</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-2" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${selectedGenre.valence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acousticness */}
                {selectedGenre.acousticness !== undefined && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{t('genreExplorer.metrics.acousticness')}</span>
                      <span className="text-sm text-gray-600">{selectedGenre.acousticness}%</span>
                    </div>
                    <div className="flex items-center">
                      <Activity size={16} className="text-orange-500 mr-2" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-orange-500"
                          style={{ width: `${selectedGenre.acousticness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Representative Artists */}
            {selectedGenre.representativeArtists && selectedGenre.representativeArtists.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('genreExplorer.genreModal.representativeArtists')}</h3>
                <div className="space-y-3">
                  {selectedGenre.representativeArtists.map((artist, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-500 mr-2" />
                          <span className="font-medium text-gray-900">
                            {language === 'ko' ? (artist.nameKo || artist.name) : artist.name}
                          </span>
                        </div>
                        <div className="flex space-x-0.5">
                          {getPopularityStars(artist.popularity)}
                        </div>
                      </div>
                        {artist.keyTracks && artist.keyTracks.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">{t('genreExplorer.genreModal.recommendedTracks')}:</div>
                           <div className="flex flex-wrap gap-2">
                             {artist.keyTracks.slice(0, 3).map((track, trackIndex) => {
                               const englishArtistName = getEnglishArtistName(artist.nameKo || artist.name);
                               const youtubeUrl = generateYouTubeSearchUrl(englishArtistName, track);
                               
                               return (
                                 <button
                                   key={trackIndex}
                                   onClick={() => {
                                     // Analytics tracking
                                     analytics.track('youtube_track_click', {
                                       artist: artist.name,
                                       track: track,
                                       genre: selectedGenre.name
                                     });
                                     openYouTubeLink(youtubeUrl, track);
                                   }}
                                   className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full hover:bg-red-100 active:bg-red-200 transition-colors border border-red-200 hover:border-red-300"
                                    title={`${t('genreExplorer.genreModal.clickToListen')} "${track}"`}
                                 >
                                   <span>{track}</span>
                                   <ExternalLink size={12} className="ml-1.5 opacity-70" />
                                 </button>
                               );
                             })}
                              {artist.keyTracks.length > 3 && (
                                <span className="text-xs text-gray-500 self-center px-2">
                                  {t('genreExplorer.genreModal.moreTracksPrefix')} {artist.keyTracks.length - 3}{t('genreExplorer.genreModal.moreTracksSuffix')}
                                </span>
                              )}
                           </div>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-genres */}
            {selectedGenre.subGenres && selectedGenre.subGenres.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('genreExplorer.genreModal.subGenres')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGenre.subGenres.map((subGenre, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {subGenre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const GenreCard: React.FC<{ genre: GenreSchema; index: number }> = ({ genre, index }) => (
    <AnimatedSection
      delay={index * 0.1}
      direction="up"
      className={`genre-card bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 cursor-pointer border-2 border-transparent hover:border-blue-300 active:scale-[0.98] touch-feedback ${
        viewMode === 'list' ? 'flex items-center space-x-4 md:space-x-6' : ''
      }`}
    >
      <div 
        className="w-full h-full" 
        onClick={() => handleGenreClick(genre)}
      >
        <div className={viewMode === 'list' ? 'flex-1' : ''}>
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {language === 'ko' ? genre.nameKo : genre.name}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ko' ? genre.name : genre.nameKo}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {genre.category}
            </span>
            {genre.era && (
              <span className="text-xs text-gray-500">{genre.era}</span>
            )}
          </div>
        </div>

        {/* 설명 */}
        <p className={`text-gray-700 mb-4 ${viewMode === 'list' ? 'text-sm' : ''}`}>
          {genre.description}
        </p>

        {/* 특성 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {genre.characteristics.slice(0, viewMode === 'list' ? 3 : 4).map((trait, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* 메트릭스 */}
        <div className={`grid gap-3 ${viewMode === 'list' ? 'grid-cols-3' : 'grid-cols-2'}`}>
           {/* 인기도 */}
           <div className="flex items-center space-x-2">
             <div className="flex space-x-0.5">
               {getPopularityStars(genre.popularity || 0)}
             </div>
             <span className="text-xs text-gray-600">{t('genreExplorer.metrics.popularity')}</span>
           </div>

           {/* 에너지 */}
           <div className="flex items-center space-x-2">
             <div className="flex items-center space-x-1">
               <div className={`w-3 h-3 rounded-full ${getEnergyColor(genre.energy || 0)}`}></div>
               <span className="text-xs text-gray-600">{genre.energy || 0}%</span>
             </div>
             <span className="text-xs text-gray-600">{t('genreExplorer.metrics.energy')}</span>
           </div>

           {/* 긍정성 (valence) */}
           {genre.valence !== undefined && (
             <div className="flex items-center space-x-2">
               <TrendingUp size={12} className="text-green-500" />
               <span className="text-xs text-gray-600">{genre.valence}% {t('genreExplorer.metrics.valence')}</span>
             </div>
           )}
        </div>
        </div>
      </div>
    </AnimatedSection>
  );

  return (
    <div className="genre-explorer min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <AnimatedSection delay={0} direction="fade" className="text-center mb-8">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('genreExplorer.title')}</h1>
          <p className="text-lg text-gray-600">{t('genreExplorer.subtitle')}</p>
        </AnimatedSection>

        {/* 필터 및 검색 */}
        <AnimatedSection delay={0.2} direction="up" className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('genreExplorer.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 카테고리 필터 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? t('genreExplorer.categories.all') : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'popularity' | 'energy' | 'era')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popularity">{t('genreExplorer.sortBy.popularity')}</option>
              <option value="name">{t('genreExplorer.sortBy.name')}</option>
              <option value="energy">{t('genreExplorer.sortBy.energy')}</option>
              <option value="era">{t('genreExplorer.sortBy.era')}</option>
            </select>

            {/* 뷰 모드 */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors touch-feedback min-h-[44px] ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors touch-feedback min-h-[44px] ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* 결과 개수 */}
          <div className="text-sm text-gray-600">
            {t('genreExplorer.resultsCount', { count: filteredAndSortedGenres.length })}
          </div>
        </AnimatedSection>

        {/* 장르 목록 */}
        <div className={`genre-grid ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredAndSortedGenres.map((genre, index) => (
            <GenreCard key={genre.id} genre={genre} index={index} />
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredAndSortedGenres.length === 0 && (
          <AnimatedSection delay={0.5} direction="fade" className="text-center py-12">
            <Music size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('genreExplorer.noResults.title')}</h3>
            <p className="text-gray-500">{t('genreExplorer.noResults.subtitle')}</p>
          </AnimatedSection>
        )}
      </div>

      {/* Genre Detail Modal */}
      <GenreDetailModal />
    </div>
  );
};

export default GenreExplorer;