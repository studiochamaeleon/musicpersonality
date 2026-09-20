'use client';

import React, { CSSProperties, useMemo, useState } from 'react';
import { ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';
import { ArtistReference, GenreSchema, MusicCatalog } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { analytics } from '@/lib/analytics';
import {
  getArtistName,
  getGenreCharacteristics,
  getGenreDescription,
  getGenreName,
  getPersonalityAnalysis,
} from '@/lib/genreTranslations';
import { getGenreTheme } from '@/lib/resultTheme';
import AnimatedSection from './ui/AnimatedSection';
import MUSICRadarChart from './ui/charts/MUSICRadarChart';

interface GenreExplorerProps {
  genres: GenreSchema[];
  musicCatalog: MusicCatalog;
  onGenreSelect?: (genre: GenreSchema) => void;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ genres, musicCatalog, onGenreSelect }) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'energy' | 'era'>('popularity');
  const [selectedGenre, setSelectedGenre] = useState<GenreSchema | null>(null);

  const copy = language === 'ko' ? {
    eyebrow: 'GENRE PERSONALITIES', title: '장르에도 성격이 있습니다.', subtitle: '32개 장르의 음악 성향과 대표 아티스트를 살펴보세요.',
    search: '장르, 분위기, 특성 검색', all: '전체 장르', popularity: '인기도 순', name: '이름 순', energy: '에너지 순', era: '시대 순',
    results: '개의 장르', noResults: '조건에 맞는 장르가 없습니다.', profile: 'MUSIC 성향', core: '핵심 특성', lifestyle: '라이프스타일 통찰',
    metrics: '음악적 특성', artists: '대표 아티스트와 입문 앨범', anchor: '장르의 기준점', discovery: '새롭게 발견할 앨범', listen: 'Spotify에서 앨범 듣기', popularityLabel: '인기도', energyLabel: '에너지', valenceLabel: '긍정성', acousticLabel: '어쿠스틱',
  } : {
    eyebrow: 'GENRE PERSONALITIES', title: 'Every genre has a personality.', subtitle: 'Explore the traits and defining artists of 32 genres.',
    search: 'Search genres, moods, and traits', all: 'All genres', popularity: 'Popularity', name: 'Name', energy: 'Energy', era: 'Era',
    results: 'genres', noResults: 'No genres match these filters.', profile: 'MUSIC profile', core: 'Core traits', lifestyle: 'Lifestyle insights',
    metrics: 'Musical profile', artists: 'Defining artists and gateway albums', anchor: 'Genre cornerstone', discovery: 'Your next discovery', listen: 'Listen to the album on Spotify', popularityLabel: 'Popularity', energyLabel: 'Energy', valenceLabel: 'Positivity', acousticLabel: 'Acoustic',
  };

  const categories = useMemo(() => ['all', ...new Set(genres.map(genre => genre.category))], [genres]);

  const filteredGenres = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return genres
      .filter(genre => {
        const searchFields = [
          getGenreName(genre, language),
          getGenreDescription(genre.id, genre.description, language),
          ...getGenreCharacteristics(genre.id, genre.characteristics, language),
        ].join(' ').toLowerCase();
        return (!query || searchFields.includes(query)) && (selectedCategory === 'all' || genre.category === selectedCategory);
      })
      .sort((a, b) => {
        if (sortBy === 'name') return getGenreName(a, language).localeCompare(getGenreName(b, language));
        if (sortBy === 'energy') return b.energy - a.energy;
        if (sortBy === 'era') return a.era.localeCompare(b.era);
        return b.popularity - a.popularity;
      });
  }, [genres, language, searchTerm, selectedCategory, sortBy]);

  const openGenre = (genre: GenreSchema) => {
    setSelectedGenre(genre);
    analytics.track('genre_viewed', {
      genreName: genre.name, genreKo: genre.nameKo, category: genre.category, popularity: genre.popularity, energy: genre.energy,
    });
    onGenreSelect?.(genre);
  };

  return (
    <div className="relative z-10 min-h-screen pb-24 text-white">
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <AnimatedSection direction="fade">
          <p className="eyebrow mb-4">{copy.eyebrow}</p>
          <div className="grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{copy.title}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/50 lg:justify-self-end">{copy.subtitle}</p>
          </div>
        </AnimatedSection>

        <div className="glass-panel mt-10 grid gap-3 rounded-3xl p-3 sm:grid-cols-[1fr_auto_auto] sm:p-4">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={17} />
            <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder={copy.search} className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/25 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--signal)]" />
          </label>
          <label className="relative block">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={16} />
            <select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)} className="min-h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#111216] pl-11 pr-10 text-sm text-white/70 outline-none focus:border-[var(--signal)] sm:w-44">
              {categories.map(category => <option key={category} value={category}>{category === 'all' ? copy.all : category}</option>)}
            </select>
          </label>
          <select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)} className="min-h-12 rounded-2xl border border-white/10 bg-[#111216] px-4 text-sm text-white/70 outline-none focus:border-[var(--signal)] sm:w-40">
            <option value="popularity">{copy.popularity}</option><option value="name">{copy.name}</option><option value="energy">{copy.energy}</option><option value="era">{copy.era}</option>
          </select>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-white/35"><span>{filteredGenres.length} {copy.results}</span><span>32 / MUSIC 5</span></div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        {filteredGenres.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGenres.map((genre, index) => {
              const theme = getGenreTheme(genre);
              const traits = getGenreCharacteristics(genre.id, genre.characteristics, language);
              return (
                <AnimatedSection key={genre.id} delay={Math.min(index * 0.025, 0.25)}>
                  <button onClick={() => openGenre(genre)} className="result-card group h-full w-full p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20">
                    <div className="flex items-start justify-between gap-5"><span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-white/38">{genre.category}</span><span className="score-tabular text-sm font-bold" style={{ color: theme.accent }}>{genre.popularity}%</span></div>
                    <h2 className="mt-8 text-2xl font-bold tracking-[-0.035em]">{getGenreName(genre, language)}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/43">{getGenreDescription(genre.id, genre.description, language)}</p>
                    <div className="mt-6 flex flex-wrap gap-2">{traits.slice(0, 3).map(trait => <span key={trait} className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/34">#{trait}</span>)}</div>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/8 pt-4 text-xs text-white/35"><span>{copy.energyLabel} <strong className="ml-1 text-white/68">{genre.energy}</strong></span><span>{copy.valenceLabel} <strong className="ml-1 text-white/68">{genre.valence}</strong></span></div>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>
        ) : <div className="result-card py-20 text-center text-sm text-white/45">{copy.noResults}</div>}
      </section>

      {selectedGenre && <GenreDetailModal genre={selectedGenre} artists={musicCatalog.genres[selectedGenre.id] || []} copy={copy} language={language} onClose={() => setSelectedGenre(null)} />}
    </div>
  );
};

interface DetailCopy {
  profile: string; core: string; lifestyle: string; metrics: string; artists: string;
  anchor: string; discovery: string; listen: string;
  popularityLabel: string; energyLabel: string; valenceLabel: string; acousticLabel: string;
}

const GenreDetailModal = ({ genre, artists, copy, language, onClose }: { genre: GenreSchema; artists: ArtistReference[]; copy: DetailCopy; language: 'ko' | 'en'; onClose: () => void }) => {
  const analysis = genre.personalityAnalysis ? getPersonalityAnalysis(genre.id, genre.personalityAnalysis, language) : null;
  const theme = getGenreTheme(genre);
  const style = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;
  const metrics = [[copy.popularityLabel, genre.popularity], [copy.energyLabel, genre.energy], [copy.valenceLabel, genre.valence], [copy.acousticLabel, genre.acousticness]] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={getGenreName(genre, language)} style={style} onClick={event => event.stopPropagation()} className="result-surface max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] border border-white/10 shadow-2xl sm:rounded-[28px]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/10 bg-[#090a0d]/90 px-5 py-5 backdrop-blur-xl sm:px-8">
          <div><p className="text-[10px] font-bold tracking-[0.16em] text-white/35">{genre.category} · {genre.era}</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">{getGenreName(genre, language)}</h2></div>
          <button onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:bg-white/10 hover:text-white"><X size={19} /></button>
        </header>

        <div className="space-y-10 px-5 py-7 sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div><p className="eyebrow mb-4">{copy.profile}</p><p className="text-base leading-8 text-white/62">{getGenreDescription(genre.id, genre.description, language)}</p><div className="mt-5 flex flex-wrap gap-2">{getGenreCharacteristics(genre.id, genre.characteristics, language).map(trait => <span key={trait} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/52">{trait}</span>)}</div></div>
            <div className="result-card p-2 sm:p-4"><MUSICRadarChart personalityScores={genre.personalityProfile} animated={false} size="sm" /></div>
          </div>

          {analysis && <div className="grid gap-4 lg:grid-cols-2">
            <section className="result-card p-6"><h3 className="text-xl font-bold">{copy.core}</h3><div className="mt-5 space-y-5">{analysis.coreTraits.slice(0, 4).map(trait => <div key={trait.traitName}><div className="flex justify-between gap-4"><h4 className="font-semibold text-white/82">{trait.traitName}</h4><span className="score-tabular font-bold" style={{ color: theme.accent }}>{trait.score}</span></div><p className="mt-2 text-sm leading-6 text-white/45">{trait.description}</p></div>)}</div></section>
            <section className="result-card p-6"><h3 className="text-xl font-bold">{copy.lifestyle}</h3><ul className="mt-5 space-y-4">{analysis.lifestyleInsights.slice(0, 5).map((insight, index) => <li key={insight} className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-white/52"><span className="score-tabular font-bold" style={{ color: theme.accent }}>0{index + 1}</span>{insight}</li>)}</ul></section>
          </div>}

          <section><h3 className="text-xl font-bold">{copy.metrics}</h3><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="result-card p-5"><div className="flex items-end justify-between gap-3"><span className="text-sm text-white/48">{label}</span><strong className="score-tabular text-2xl">{value}%</strong></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div></div>)}</div></section>

          {artists.length > 0 && <section><h3 className="text-xl font-bold">{copy.artists}</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{artists.map(artist => <article key={artist.name} className="result-card p-5"><div className="flex items-start justify-between gap-4"><div><h4 className="font-semibold">{getArtistName(artist, language)}</h4>{language === 'ko' && <p className="mt-1 text-xs text-white/35">{artist.name}</p>}</div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{copy[artist.role]}</span></div><div className="mt-5 border-t border-white/10 pt-5"><p className="font-semibold leading-6 text-white/82">{artist.album.title}</p><p className="mt-1 text-xs text-white/35">{artist.album.year}{artist.album.credit ? ` · ${artist.album.credit}` : ''}</p><a href={artist.album.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${getArtistName(artist, language)} · ${artist.album.title}: ${copy.listen}`} onClick={() => analytics.track('music_link_click', { provider: 'spotify', contentType: 'album', artist: artist.name, album: artist.album.title, genre: genre.name, context: 'genre-explorer' })} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#1ed760] px-4 text-xs font-bold text-black transition-transform hover:-translate-y-0.5">{copy.listen}<ExternalLink size={12} /></a></div></article>)}</div></section>}
        </div>
      </div>
    </div>
  );
};

export default GenreExplorer;
