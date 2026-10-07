'use client';

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronDown, ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';
import { GenreExplorerArtist, GenreExplorerAlbumCatalog, GenreSchema, MusicCatalog } from '@/types';
import type { Language } from '@/types/i18n';
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
import { buildGenreSearchIndex, matchesGenreSearch } from '@/lib/genreSearch';
import { selectGenreExplorerAlbums } from '@/lib/genreExplorerAlbums';
import explorerAlbumData from '@/data/genreExplorerAlbums.json';
import AnimatedSection from './ui/AnimatedSection';
import MUSICRadarChart from './ui/charts/MUSICRadarChart';

interface GenreExplorerProps {
  genres: GenreSchema[];
  musicCatalog: MusicCatalog;
  onGenreSelect?: (genre: GenreSchema) => void;
}

const CATEGORY_LABELS: Record<GenreSchema['category'], Record<Language, string>> = {
  JAZZ: { ko: '재즈', en: 'Jazz', ja: 'ジャズ' }, ROCK: { ko: '록', en: 'Rock', ja: 'ロック' }, ELECTRONIC: { ko: '일렉트로닉', en: 'Electronic', ja: 'エレクトロニック' }, CLASSICAL: { ko: '클래식', en: 'Classical', ja: 'クラシック' },
  POP: { ko: '팝', en: 'Pop', ja: 'ポップ' }, HIP_HOP: { ko: '힙합', en: 'Hip-Hop', ja: 'ヒップホップ' }, RNB: { ko: 'R&B', en: 'R&B', ja: 'R&B' }, WORLD: { ko: '월드', en: 'World', ja: 'ワールド' },
};

const explorerAlbums = explorerAlbumData as GenreExplorerAlbumCatalog;

function categoryLabel(category: GenreSchema['category'], language: Language) {
  return CATEGORY_LABELS[category][language];
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ genres, musicCatalog, onGenreSelect }) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jpopOnly, setJpopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'energy' | 'era'>('popularity');
  const [selectedGenre, setSelectedGenre] = useState<GenreSchema | null>(null);
  const genreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const copy = language === 'ko' ? {
    eyebrow: '장르의 성격', title: '장르에도 성격이 있습니다.', subtitle: `${genres.length}개 장르의 음악 성향과 대표 아티스트를 살펴보세요.`,
    search: '장르·아티스트·곡 검색', all: '전체 장르', popularity: '인기도 순', name: '이름 순', energy: '에너지 순', era: '시대 순',
    results: '개의 장르', noResults: '조건에 맞는 장르가 없습니다.', category: '음악 장르', sort: '정렬 기준', scene: '장면으로 찾아보기', reset: '필터 초기화', clearSearch: '검색어 지우기', emptyHint: '다른 검색어를 입력하거나 필터를 초기화해보세요.', profile: 'MUSIC 성향', core: '핵심 특성', lifestyle: '라이프스타일 통찰',
    metrics: '음악적 특성', artists: '대표 아티스트와 입문 앨범', anchor: '장르의 기준점', discovery: '새롭게 발견할 앨범', bridge: '장면을 잇는 앨범', listen: 'Spotify에서 앨범 듣기', popularityLabel: '인기도', energyLabel: '에너지', valenceLabel: '긍정성', acousticLabel: '어쿠스틱', profileNote: 'MUSIC 수치와 아래 설명은 이 장르의 대표 프로필이며, 개인 검사 결과가 아닙니다.', traitScore: '장르 특성 점수', more: '장르 성격 해석 더 보기', strengths: '이 음악의 매력', challenges: '곡을 고를 때 참고할 점', relationship: '친구와 나눌 음악 이야기', preferences: '어울리는 음악', activities: '해볼 만한 활동',
  } : language === 'ja' ? {
    eyebrow: 'ジャンルの性格', title: 'ジャンルにも、性格がある。', subtitle: `${genres.length}ジャンルの音楽的な個性と代表アーティストを見てみましょう。`,
    search: 'ジャンル・アーティスト・曲を検索', all: 'すべて', popularity: '人気順', name: '名前順', energy: 'エネルギー順', era: '年代順',
    results: 'ジャンル', noResults: '条件に合うジャンルがありません。', category: '音楽ジャンル', sort: '並び替え', scene: 'シーンから探す', reset: 'フィルターをリセット', clearSearch: '検索をクリア', emptyHint: '別のキーワードで検索するか、フィルターをリセットしてみてください。', profile: 'MUSICプロファイル', core: '核心的な特徴', lifestyle: 'ライフスタイルのヒント',
    metrics: '音楽的特性', artists: '代表アーティストと入門アルバム', anchor: 'ジャンルの基準点', discovery: '次に出会うアルバム', bridge: 'シーンをつなぐアルバム', listen: 'Spotifyでアルバムを聴く', popularityLabel: '人気度', energyLabel: 'エネルギー', valenceLabel: 'ポジティブ度', acousticLabel: 'アコースティック', profileNote: 'このMUSICスコアと説明はジャンルの編集的プロファイルであり、個人の診断結果ではありません。', traitScore: 'ジャンル特性スコア', more: 'ジャンル性格の全文を読む', strengths: 'この音楽の魅力', challenges: '曲を選ぶヒント', relationship: '友達と話したい音楽のこと', preferences: 'おすすめの音', activities: '試してみたいこと',
  } : {
    eyebrow: 'GENRE PERSONALITIES', title: 'Every genre has a personality.', subtitle: `Explore the traits and defining artists of ${genres.length} genres.`,
    search: 'Search genres, artists, and tracks', all: 'All genres', popularity: 'Popularity', name: 'Name', energy: 'Energy', era: 'Era',
    results: 'genres', noResults: 'No genres match these filters.', category: 'Music genre', sort: 'Sort by', scene: 'Explore a scene', reset: 'Reset filters', clearSearch: 'Clear search', emptyHint: 'Try another search or reset the filters to keep exploring.', profile: 'MUSIC profile', core: 'Core traits', lifestyle: 'Lifestyle insights',
    metrics: 'Musical profile', artists: 'Defining artists and gateway albums', anchor: 'Genre cornerstone', discovery: 'Your next discovery', bridge: 'Across scenes', listen: 'Listen to the album on Spotify', popularityLabel: 'Popularity', energyLabel: 'Energy', valenceLabel: 'Positivity', acousticLabel: 'Acoustic', profileNote: 'These MUSIC scores and notes describe an editorial genre profile, not your personal survey result.', traitScore: 'Genre profile score', more: 'Read the full genre personality note', strengths: 'What this music brings', challenges: 'Tips for choosing tracks', relationship: 'Music to talk about with a friend', preferences: 'Music to try', activities: 'Activities to try',
  };

  const categories = useMemo(() => ['all', ...new Set(genres.map(genre => genre.category))], [genres]);
  const jpopGenreIds = useMemo(() => new Set((musicCatalog.crossovers || []).filter(artist => artist.scene === 'jpop').flatMap(artist => artist.genreIds)), [musicCatalog]);
  const searchIndex = useMemo(() => buildGenreSearchIndex(genres, musicCatalog, explorerAlbums.genres), [genres, musicCatalog]);

  const filteredGenres = useMemo(() => {
    return genres
      .filter(genre => {
        return matchesGenreSearch(searchIndex.get(genre.id) || [], searchTerm) && (selectedCategory === 'all' || genre.category === selectedCategory) && (!jpopOnly || jpopGenreIds.has(genre.id));
      })
      .sort((a, b) => {
        if (sortBy === 'name') return getGenreName(a, language).localeCompare(getGenreName(b, language));
        if (sortBy === 'energy') return b.energy - a.energy;
        if (sortBy === 'era') return a.era.localeCompare(b.era);
        return b.popularity - a.popularity;
      });
  }, [genres, jpopGenreIds, jpopOnly, language, searchIndex, searchTerm, selectedCategory, sortBy]);

  const openGenre = (genre: GenreSchema, trigger: HTMLButtonElement) => {
    genreTriggerRef.current = trigger;
    setSelectedGenre(genre);
    analytics.track('genre_viewed', {
      genreName: genre.name, genreKo: genre.nameKo, category: genre.category, popularity: genre.popularity, energy: genre.energy,
    });
    onGenreSelect?.(genre);
  };

  const toggleJpopScene = () => {
    if (!jpopOnly) setSelectedCategory('all');
    setJpopOnly(value => !value);
  };

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setJpopOnly(false);
  };

  const hasFilters = Boolean(searchTerm.trim() || selectedCategory !== 'all' || jpopOnly);
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setJpopOnly(false);
    searchRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="genre-explorer relative z-10 min-h-screen pb-24 text-white">
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <AnimatedSection direction="fade">
          <p className="eyebrow mb-4">{copy.eyebrow}</p>
          <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <h1 className="min-w-0 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] sm:text-6xl">{copy.title}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/75 lg:justify-self-end">{copy.subtitle}</p>
          </div>
        </AnimatedSection>

        <div className="glass-panel mt-10 rounded-3xl p-4 sm:p-5">
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_10rem] lg:items-end">
            <div className="relative min-w-0 min-[480px]:col-span-2 lg:col-span-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/55" size={18} />
              <input ref={searchRef} value={searchTerm} onChange={event => setSearchTerm(event.target.value)} onKeyDown={event => { if (event.key === 'Escape' && searchTerm) { event.preventDefault(); setSearchTerm(''); } }} aria-label={copy.search} placeholder={copy.search} className="min-h-12 w-full min-w-0 rounded-2xl border border-white/15 bg-black/25 pl-11 pr-12 text-base text-white outline-none transition-colors placeholder:text-white/55 focus:border-[var(--signal)] sm:text-sm" />
              {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); searchRef.current?.focus({ preventScroll: true }); }} aria-label={copy.clearSearch} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-white/65 transition-colors hover:bg-white/10 hover:text-white"><X size={16} /></button>}
            </div>
            <label className="block min-w-0">
              <span className="mb-2 block px-1 text-[11px] font-semibold text-white/60">{copy.category}</span>
              <span className="relative block">
                <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/55" size={15} />
                <select value={selectedCategory} onChange={event => changeCategory(event.target.value)} aria-label={copy.all} className="min-h-12 w-full min-w-0 appearance-none rounded-2xl border border-white/15 bg-[#111216] pl-9 pr-8 text-base text-white/85 outline-none transition-colors focus:border-[var(--signal)] sm:text-sm">
                  {categories.map(category => <option key={category} value={category}>{category === 'all' ? copy.all : categoryLabel(category as GenreSchema['category'], language)}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/55" size={14} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="mb-2 block px-1 text-[11px] font-semibold text-white/60">{copy.sort}</span>
              <span className="relative block">
                <select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)} aria-label={language === 'ko' ? '장르 정렬' : language === 'ja' ? 'ジャンルの並び替え' : 'Sort genres'} className="min-h-12 w-full min-w-0 appearance-none rounded-2xl border border-white/15 bg-[#111216] pl-3.5 pr-8 text-base text-white/85 outline-none transition-colors focus:border-[var(--signal)] sm:text-sm">
                  <option value="popularity">{copy.popularity}</option><option value="name">{copy.name}</option><option value="energy">{copy.energy}</option><option value="era">{copy.era}</option>
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/55" size={14} />
              </span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/8 pt-4">
            <span className="text-[11px] font-semibold text-white/60">{copy.scene}</span>
            <button type="button" aria-pressed={jpopOnly} onClick={toggleJpopScene} className={`min-h-11 rounded-full border px-4 text-xs font-semibold transition-colors ${jpopOnly ? 'border-[var(--signal)] bg-[var(--signal)] text-black' : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/30 hover:bg-white/10'}`}>J-POP · {language === 'ko' ? '일본 음악' : language === 'ja' ? '日本の音楽' : 'Japanese music'}</button>
            {hasFilters && <button type="button" onClick={resetFilters} className="min-h-11 rounded-full px-3 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:ml-auto">{copy.reset}</button>}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60"><span role="status"><strong className="score-tabular mr-1.5 text-base font-bold text-white/90">{filteredGenres.length}</strong>{copy.results}</span><span className="font-mono text-[10px] tracking-[0.12em]">MUSIC / 5</span></div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        {filteredGenres.length > 0 ? (
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGenres.map((genre, index) => {
              const theme = getGenreTheme(genre);
              const traits = getGenreCharacteristics(genre.id, genre.characteristics, language);
              return (
                <AnimatedSection key={genre.id} delay={Math.min(index * 0.025, 0.25)} className="h-full min-w-0">
                  <button onClick={event => openGenre(genre, event.currentTarget)} style={{ '--result-accent': theme.accent } as CSSProperties} className="result-card group relative flex h-full min-w-0 w-full flex-col overflow-hidden p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--result-accent)]/35 sm:p-6">
                    <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px opacity-65 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }} />
                    <div className="flex items-center justify-between gap-4"><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/75">{categoryLabel(genre.category, language)}</span><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors group-hover:border-[var(--result-accent)]/40 group-hover:text-[var(--result-accent)]"><ArrowUpRight size={18} /></span></div>
                    <h2 className="mt-6 min-w-0 text-balance text-[1.65rem] font-bold leading-tight tracking-[-0.035em]">{getGenreName(genre, language)}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">{getGenreDescription(genre.id, genre.description, language)}</p>
                    <div className="mb-6 mt-5 flex flex-wrap gap-x-3 gap-y-2">{traits.slice(0, 3).map(trait => <span key={trait} className="text-[11px] font-medium text-white/60">#{trait}</span>)}</div>
                    <div className="mt-auto grid min-w-0 grid-cols-3 gap-3 border-t border-white/10 pt-4 text-white/65">{[[copy.popularityLabel, genre.popularity], [copy.energyLabel, genre.energy], [copy.valenceLabel, genre.valence]].map(([label, value]) => <div key={label} className="min-w-0"><span className="block text-[10px] leading-4">{label}</span><strong className="score-tabular mt-1 block text-base font-semibold text-white/90">{value}<span className="ml-0.5 text-[10px] font-medium text-white/45">%</span></strong></div>)}</div>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>
        ) : <div className="result-card flex flex-col items-center px-6 py-16 text-center"><Search aria-hidden="true" size={26} className="mb-5 text-white/35" /><p className="text-base font-semibold text-white/85">{copy.noResults}</p><p className="mt-3 max-w-sm text-sm leading-6 text-white/60">{copy.emptyHint}</p>{hasFilters && <button type="button" onClick={resetFilters} className="secondary-action mt-6 text-sm">{copy.reset}</button>}</div>}
      </section>

      {selectedGenre && createPortal(<GenreDetailModal genre={selectedGenre} artists={selectGenreExplorerAlbums(selectedGenre.id, musicCatalog, explorerAlbums, searchTerm, jpopOnly)} copy={copy} language={language} returnFocusRef={genreTriggerRef} onClose={() => setSelectedGenre(null)} />, document.body)}
    </div>
  );
};

interface DetailCopy {
  profile: string; core: string; lifestyle: string; metrics: string; artists: string;
  anchor: string; discovery: string; bridge: string; listen: string;
  popularityLabel: string; energyLabel: string; valenceLabel: string; acousticLabel: string;
  profileNote: string; traitScore: string; more: string; strengths: string; challenges: string;
  relationship: string; preferences: string; activities: string;
}

const GenreDetailModal = ({ genre, artists, copy, language, returnFocusRef, onClose }: { genre: GenreSchema; artists: GenreExplorerArtist[]; copy: DetailCopy; language: Language; returnFocusRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const trigger = returnFocusRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousScroll = { left: window.scrollX, top: window.scrollY };
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const focusWithinDialog = (element: HTMLElement) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Native focus scrolling can move the smooth-scrolling page as well as
      // the modal. Keep keyboard navigation inside this scroll container.
      element.focus({ preventScroll: true });
      const target = element.getBoundingClientRect();
      const bounds = dialog.getBoundingClientRect();
      const offset = target.top < bounds.top ? target.top - bounds.top
        : target.bottom > bounds.bottom ? target.bottom - bounds.bottom : 0;
      if (offset) dialog.scrollTo({ top: dialog.scrollTop + offset, behavior: 'instant' });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); focusWithinDialog(last); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); focusWithinDialog(first); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      const returnTarget = trigger?.isConnected ? trigger : previousFocus?.isConnected ? previousFocus : null;
      if (returnTarget) {
        returnTarget.focus({ preventScroll: true });
        // Also cancel any pending native smooth focus scroll. Do not restore
        // the old page position when navigation has removed the trigger.
        window.scrollTo({ ...previousScroll, behavior: 'instant' });
      }
    };
  }, [returnFocusRef]);
  const analysis = genre.personalityAnalysis ? getPersonalityAnalysis(genre.id, genre.personalityAnalysis, language, genre.characteristics) : null;
  const theme = getGenreTheme(genre);
  const style = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;
  const metrics = [[copy.popularityLabel, genre.popularity], [copy.energyLabel, genre.energy], [copy.valenceLabel, genre.valence], [copy.acousticLabel, genre.acousticness]] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-5" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="genre-detail-title" style={style} onClick={event => event.stopPropagation()} className="result-surface max-h-[94dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-[28px] border border-white/10 shadow-2xl sm:rounded-[28px]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#090a0d]/95 px-5 py-5 backdrop-blur-xl sm:px-8 sm:py-6">
          <div className="min-w-0"><p className="text-[10px] font-bold leading-5 tracking-[0.12em] text-white/65">{categoryLabel(genre.category, language)} · {genre.era}</p><h2 id="genre-detail-title" className="mt-2 min-w-0 text-balance text-[1.7rem] font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl">{getGenreName(genre, language)}</h2></div>
          <button ref={closeRef} onClick={onClose} aria-label={language === 'ko' ? '닫기' : language === 'ja' ? '閉じる' : 'Close'} className="ui-icon-button shrink-0"><X size={19} /></button>
        </header>

        <div className="space-y-8 px-5 pt-7 pb-[max(2rem,env(safe-area-inset-bottom))] sm:space-y-10 sm:px-8 sm:py-10">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-8">
            <div><p className="eyebrow mb-4">{copy.profile}</p><p className="text-base leading-8 text-white/72">{getGenreDescription(genre.id, genre.description, language)}</p><p className="mt-3 text-xs leading-5 text-white/65">{copy.profileNote}</p><div className="mt-5 flex flex-wrap gap-2">{getGenreCharacteristics(genre.id, genre.characteristics, language).map(trait => <span key={trait} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70">{trait}</span>)}</div></div>
            <div className="result-card p-2 sm:p-4"><MUSICRadarChart personalityScores={genre.personalityProfile} animated={false} size="sm" /></div>
          </div>

          {analysis && <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <section className="result-card min-w-0 p-5 sm:p-6"><h3 className="text-xl font-bold">{copy.core}</h3><div className="mt-5 space-y-5">{analysis.coreTraits.map(trait => <div key={trait.traitName}><h4 className="font-semibold text-white/82">{trait.traitName}</h4><p className="mt-2 text-sm leading-6 text-white/70">{trait.description}</p><p className="mt-2 border-l border-white/15 pl-3 text-xs leading-5 text-white/65">{trait.impact}</p></div>)}</div></section>
            <section className="result-card min-w-0 p-5 sm:p-6"><h3 className="text-xl font-bold">{copy.lifestyle}</h3><ul className="mt-5 space-y-4">{analysis.lifestyleInsights.map((insight, index) => <li key={insight} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 text-sm leading-6 text-white/70"><span className="score-tabular font-bold" style={{ color: theme.accent }}>0{index + 1}</span>{insight}</li>)}</ul></section>
          </div>}

          {analysis && <details className="result-card p-6"><summary className="cursor-pointer text-lg font-bold">{copy.more}</summary><p className="mt-6 border-t border-white/10 pt-6 text-sm leading-7 text-white/70">{analysis.description}</p><div className="mt-6 grid gap-7 sm:grid-cols-2"><div><h3 className="font-bold">{copy.strengths}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{analysis.strengths.map(item => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="font-bold">{copy.challenges}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{analysis.challenges.map(item => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="font-bold">{copy.relationship}</h3><p className="mt-3 text-sm leading-6 text-white/70">{analysis.relationshipCompatibility}</p></div><div><h3 className="font-bold">{copy.preferences}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{analysis.musicPreferences.map(item => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="font-bold">{copy.activities}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{analysis.recommendedActivities.map(item => <li key={item}>• {item}</li>)}</ul></div></div></details>}

          <section><h3 className="text-xl font-bold">{copy.metrics}</h3><p className="mt-2 text-xs leading-5 text-white/65">{copy.profileNote}</p><div className="mt-5 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="result-card min-w-0 p-4 sm:p-5"><span className="block min-h-5 text-xs leading-5 text-white/70">{label}</span><strong className="score-tabular mt-2 block text-2xl font-bold">{value}<span className="ml-0.5 text-sm font-medium text-white/55">%</span></strong><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div></div>)}</div></section>

          {artists.length > 0 && <section><h3 className="text-xl font-bold">{copy.artists}</h3><div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">{artists.map(artist => <article key={artist.name} className="result-card flex min-w-0 flex-col p-5"><div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3"><div className="min-w-0"><h4 className="text-lg font-semibold leading-6">{getArtistName(artist, language)}</h4>{language === 'ko' && <p className="mt-1 text-xs text-white/55">{artist.name}</p>}</div><span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold leading-4 text-white/65">{copy[artist.role]}</span></div><div className="mt-5 flex flex-1 flex-col border-t border-white/10 pt-5"><p className="font-semibold leading-6 text-white/85">{artist.album.title}</p><p className="mt-1 text-xs leading-5 text-white/55">{artist.album.year}{artist.album.credit ? ` · ${artist.album.credit}` : ''}</p><div className="mt-auto pt-4"><a href={artist.album.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${getArtistName(artist, language)} · ${artist.album.title}: ${copy.listen}`} onClick={() => analytics.track('music_link_click', { provider: 'spotify', contentType: 'album', artist: artist.name, album: artist.album.title, genre: genre.name, context: 'genre-explorer' })} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1ed760] px-4 py-2.5 text-center text-xs font-bold leading-5 text-black transition-transform hover:-translate-y-0.5 sm:w-auto">{copy.listen}<ExternalLink aria-hidden="true" className="shrink-0" size={13} /></a></div></div></article>)}</div></section>}
        </div>
      </div>
    </div>
  );
};

export default GenreExplorer;
