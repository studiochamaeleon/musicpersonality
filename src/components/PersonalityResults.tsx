'use client';

import React, { CSSProperties, lazy, useEffect, useState } from 'react';
import { ArrowDown, Check, ExternalLink, RotateCcw, Share2, Users } from 'lucide-react';
import { MUSICPersonality, EnhancedRecommendationScore, GenreSchema, RecommendedArtist } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGenreDescription, getGenreCharacteristics, getPersonalityAnalysis, getGenreName, getArtistName, getArtistSubtitle } from '@/lib/genreTranslations';
import { analytics } from '@/lib/analytics';
import { getGenreTheme, getResultUrl } from '@/lib/resultTheme';
import { getCompatiblePersonalityTypes } from '@/lib/musicCalculations';
import { getGenreSound, getResultIdentityCopy } from '@/lib/resultIdentity';
import AnimatedSection from './ui/AnimatedSection';
import ShareableCard from './ui/ShareableCard';
import ResultMatchStory from './ResultMatchStory';

const MUSICRadarChart = lazy(() => import('./ui/charts/MUSICRadarChart'));

interface PersonalityResultsProps {
  personalityScores: MUSICPersonality;
  recommendedGenres: EnhancedRecommendationScore[];
  genres: GenreSchema[];
  recommendedArtists?: RecommendedArtist[];
  onRestart?: () => void;
  onInviteFriend?: () => void;
}

const PersonalityResults: React.FC<PersonalityResultsProps> = ({ personalityScores, recommendedGenres, genres, recommendedArtists = [], onRestart, onInviteFriend }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showStickyActions, setShowStickyActions] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const topRecommendation = recommendedGenres[0];
  const topGenre = genres.find(genre => genre.id === topRecommendation?.genreId);
  const runnerUp = genres.find(genre => genre.id === recommendedGenres[1]?.genreId);
  const hasDisplayTie = Boolean(runnerUp && recommendedGenres[1].compatibility === topRecommendation?.compatibility);
  const theme = getGenreTheme(topGenre);
  const personalityAnalysis = topGenre?.personalityAnalysis
    ? getPersonalityAnalysis(topGenre.id, topGenre.personalityAnalysis, language)
    : null;
  const pageStyle = {
    '--result-accent': theme.accent,
    '--result-secondary': theme.secondary,
  } as CSSProperties;

  useEffect(() => {
    const updateStickyActions = () => {
      const shareTop = document.getElementById('share')?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      setShowStickyActions(window.scrollY > 480 && shareTop > window.innerHeight * 0.75);
    };
    updateStickyActions();
    window.addEventListener('scroll', updateStickyActions, { passive: true });
    return () => window.removeEventListener('scroll', updateStickyActions);
  }, []);

  if (!topGenre || !topRecommendation) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-white/60">{t('results.cannotLoadGenre')}</p></div>;
  }

  const traits = getGenreCharacteristics(topGenre.id, topGenre.characteristics, language).slice(0, 4);
  const typeTitle = personalityAnalysis?.typeTitle || getGenreName(topGenre, language);
  const identityCopy = getResultIdentityCopy(language);
  const genreSound = getGenreSound(topGenre.id, language);
  const compatibleTypes = getCompatiblePersonalityTypes(personalityScores, genres, language);
  const resultCopy = language === 'ko'
    ? { eyebrow: '당신의 음악 성격', lead: '당신과 가장 닮은 장르', match: '장르 유사도', spectrum: '나의 취향 스펙트럼', spectrumBody: '다섯 개의 축이 당신의 음악 취향을 어떻게 구성하는지 보여줍니다.', next: '함께 들으면 좋은 장르', artists: '당신을 위한 아티스트와 앨범', detail: '성격 해석', invite: '친구와 음악 궁합 보기', share: '결과 공유하기', again: '다시 검사하기', genreProfile: '아래 성격 해석은 가장 닮은 장르의 대표 프로필을 바탕으로 한 재미있는 읽을거리예요.', metricNote: '이 수치는 내 검사 점수가 아닌 추천 장르의 사운드 프로필입니다.', traitScore: '장르 특성 점수', relationship: '관계에서의 모습', preferences: '어울리는 음악', activities: '해볼 만한 활동', compatible: '함께 탐색할 장르', exploreNote: '관계 궁합이 아니라, 다른 음악 취향을 발견하기 위한 아이디어예요.', contexts: '이럴 때 들어보세요', growth: '새롭게 탐험할 지점', genreMatch: '장르 유사도', card: '결과 카드', nextTag: '다음에 들을 음악', artistTag: '아티스트 추천', deepTag: '더 깊이 보기', shareTag: '결과 보여주기', nearTie: '같은 표시 점수의 장르도 있어요', shortNote: '자기보고 취향 비교 · 성격 진단 아님' }
    : language === 'ja'
      ? { eyebrow: 'あなたの音楽性格', lead: 'あなたに最も似たジャンル', match: 'ジャンル一致度', spectrum: 'あなたの好みスペクトル', spectrumBody: '五つの軸から、音楽の好みの組み合わせが見えてきます。', next: '次に試したいジャンル', artists: 'あなたへのアーティストとアルバム', detail: '性格メモ', invite: '友達と音楽相性を見る', share: '結果をシェア', again: 'もう一度テスト', genreProfile: '以下の性格メモは、最も近いジャンルプロファイルをもとにした気軽な読み物です。', metricNote: 'これらはおすすめジャンルのサウンド特性で、あなたの回答スコアではありません。', traitScore: 'ジャンル特性スコア', relationship: '人間関係での傾向', preferences: 'おすすめの音', activities: '試してみたいこと', compatible: '一緒に探したいジャンル', exploreNote: '人間関係の予測ではなく、新しい音楽に出会うためのヒントです。', contexts: 'こんな時に聴いてみて', growth: '新しく探索するポイント', genreMatch: 'ジャンル一致度', card: '結果カード', nextTag: '次に聴く音楽', artistTag: 'アーティスト提案', deepTag: 'もっと深く', shareTag: '結果を見せる', nearTie: '同じ表示スコアのジャンルもあります', shortNote: '自己申告の好み比較 · 性格診断ではありません' }
      : { eyebrow: 'YOUR MUSIC PERSONALITY', lead: 'The genre most like you', match: 'genre similarity', spectrum: 'Your taste spectrum', spectrumBody: 'Five dimensions show how your music taste is put together.', next: 'Genres to try next', artists: 'Artists and albums for your taste', detail: 'Personality notes', invite: 'Compare with a friend', share: 'Share my result', again: 'Take it again', genreProfile: 'The personality note below is a playful interpretation of your closest genre profile.', metricNote: 'These are the recommended genre’s sound attributes, not your survey scores.', traitScore: 'Genre profile score', relationship: 'Relationships', preferences: 'Music to try', activities: 'Activities to try', compatible: 'Other genres to explore', exploreNote: 'These are discovery ideas, not predictions of relationship compatibility.', contexts: 'Good moments to listen', growth: 'A different sound to discover', genreMatch: 'Genre similarity', card: 'RESULT CARD', nextTag: 'NEXT LISTEN', artistTag: 'ARTIST PICKS', deepTag: 'DEEP DIVE', shareTag: 'SHOW YOUR RESULT', nearTie: 'Another genre shares this displayed score', shortNote: 'Self-reported taste match · not a diagnosis' };
  const albumCopy = language === 'ko'
    ? { anchor: '장르의 기준점', discovery: '새롭게 발견할 앨범', listen: 'Spotify에서 앨범 듣기' }
    : language === 'ja'
      ? { anchor: 'ジャンルの基準点', discovery: '次に出会うアルバム', listen: 'Spotifyでアルバムを聴く' }
      : { anchor: 'Genre cornerstone', discovery: 'Your next discovery', listen: 'Listen to the album on Spotify' };
  const insightCopy = language === 'ko'
    ? { eyebrow: '성격 해석', title: '취향에서 읽은 당신의 모습', core: '핵심 특성', lifestyle: '라이프스타일 통찰', music: '추천 장르의 사운드', popularity: '인기도', energy: '에너지', valence: '긍정성', acousticness: '어쿠스틱' }
    : language === 'ja'
      ? { eyebrow: '性格メモ', title: '好みから見えるあなた', core: '核心的な特徴', lifestyle: 'ライフスタイルのヒント', music: 'おすすめジャンルのサウンド', popularity: '人気度', energy: 'エネルギー', valence: 'ポジティブ度', acousticness: 'アコースティック' }
      : { eyebrow: 'PERSONALITY NOTES', title: 'What your taste says about you', core: 'Core traits', lifestyle: 'Lifestyle insights', music: 'Recommended genre sound', popularity: 'Popularity', energy: 'Energy', valence: 'Positivity', acousticness: 'Acoustic' };
  const musicMetrics = [
    { label: insightCopy.popularity, value: topGenre.popularity },
    { label: insightCopy.energy, value: topGenre.energy },
    { label: insightCopy.valence, value: topGenre.valence },
    { label: insightCopy.acousticness, value: topGenre.acousticness },
  ];

  const notifyShare = (message: string) => {
    setShareFeedback(message);
    window.setTimeout(() => setShareFeedback(null), 2400);
  };

  const shareResultLink = async () => {
    const url = getResultUrl(personalityScores, language);
    const title = language === 'ko' ? `내 음악 성격은 ${typeTitle}` : language === 'ja' ? `私の音楽性格は「${typeTitle}」` : `My music personality is ${typeTitle}`;
    const text = language === 'ko'
      ? `나는 ${getGenreName(topGenre, language)}와 닮은 ${typeTitle} 타입! 너는 어떤 음악 성격일까?`
      : language === 'ja' ? `私は${getGenreName(topGenre, language)}に似た「${typeTitle}」タイプ。あなたの音楽性格は？` : `I'm a ${typeTitle} with a ${getGenreName(topGenre, language)} sound. What's your music type?`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        analytics.track('result_shared', { shareType: 'sticky-native-link', topGenre: topGenre.name, personalityScores });
        return;
      }
      await navigator.clipboard.writeText(url);
      analytics.track('result_shared', { shareType: 'sticky-copy', topGenre: topGenre.name, personalityScores });
      notifyShare(language === 'ko' ? '결과 링크를 복사했어요.' : language === 'ja' ? '結果リンクをコピーしました。' : 'Result link copied.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notifyShare(language === 'ko' ? '공유하지 못했어요.' : language === 'ja' ? '結果をシェアできませんでした。' : 'Could not share the result.');
    }
  };

  return (
    <main className="result-surface min-h-screen pb-24 text-white sm:pb-0" style={pageStyle}>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <AnimatedSection direction="fade" duration={0.45}>
          <div className="mb-12 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold tracking-[-0.03em]">MUTI</p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/60">{resultCopy.card}</p>
            </div>
            {onRestart && <button onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><RotateCcw size={15} />{resultCopy.again}</button>}
          </div>

          <div className="grid min-w-0 items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="eyebrow mb-5" style={{ color: theme.accent }}>{resultCopy.eyebrow}</p>
              <h1 className="max-w-4xl min-w-0 font-extrabold tracking-[-0.06em]">
                <span className="block text-sm font-semibold tracking-[-0.02em] text-white/65 sm:text-base">{identityCopy.opening}</span>
                <span className="mt-3 block text-[clamp(2.55rem,10vw,6.6rem)] leading-[1.05] [overflow-wrap:anywhere]">
                  <span style={{ color: theme.accent }}>{identityCopy.quoteOpen}{getGenreName(topGenre, language)}{identityCopy.quoteClose}</span><span className="ml-1 text-[0.43em] align-baseline tracking-[-0.04em] text-white">{identityCopy.ending}</span>
                </span>
              </h1>
              <p className="mt-6 max-w-2xl leading-tight">
                <span className="block text-base font-medium leading-7 text-white/70 sm:text-lg">{language === 'en' ? `${identityCopy.affinity} ${genreSound},` : `${genreSound}${identityCopy.affinity}`}</span>
                <strong className="mt-1 block text-[clamp(1.6rem,5.8vw,2.8rem)] font-extrabold leading-[1.18] tracking-[-0.04em] [overflow-wrap:anywhere]">{typeTitle}</strong>
              </p>
            </div>
            <div className="lg:pb-2 lg:text-right">
              <p className="score-tabular text-7xl font-extrabold tracking-[-0.07em] sm:text-8xl" style={{ color: theme.accent }}>{topRecommendation.compatibility}<span className="text-2xl">%</span></p>
              <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">{resultCopy.match}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/70">{resultCopy.shortNote}</p>
              {hasDisplayTie && runnerUp && <p className="mt-2 max-w-48 text-xs leading-5 text-white/70 lg:ml-auto">{resultCopy.nearTie}: <a href="#next-listen" className="underline underline-offset-2">{getGenreName(runnerUp, language)}</a></p>}
            </div>
          </div>

          <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1.25fr_.75fr]">
            <p className="max-w-2xl text-lg leading-8 text-white/67">{personalityAnalysis?.description || getGenreDescription(topGenre.id, topGenre.description, language)}</p>
            <div className="flex flex-wrap content-start gap-2 lg:justify-end">
              {traits.map(trait => <span key={trait} className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/68">{trait}</span>)}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#share" className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{resultCopy.share}</a>
            <a href="#spectrum" className="secondary-action inline-flex items-center justify-center gap-2">{resultCopy.spectrum}<ArrowDown size={17} /></a>
            {onInviteFriend && <button onClick={onInviteFriend} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white/70 transition-colors hover:text-white"><Users size={16} />{resultCopy.invite}</button>}
          </div>
          <ResultMatchStory scores={personalityScores} genre={topGenre} accent={theme.accent} />
        </AnimatedSection>
      </section>

      <section id="spectrum" className="border-y border-white/10 bg-black/15">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:py-24">
          <AnimatedSection delay={0.05}>
            <p className="eyebrow mb-4">MUSIC 5</p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.spectrum}</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{resultCopy.spectrumBody}</p>
          </AnimatedSection>
          <div className="result-card overflow-hidden p-3 sm:p-6">
            <MUSICRadarChart personalityScores={personalityScores} animated showTooltip size="md" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-9">
          <p className="eyebrow mb-3">{insightCopy.eyebrow}</p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{insightCopy.title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">{resultCopy.genreProfile}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <article className="result-card p-6 sm:p-8 lg:col-span-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold tracking-[-0.025em]">{insightCopy.core}</h3>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-white/28">01</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {personalityAnalysis?.coreTraits.map(trait => (
                <div key={trait.traitName} className="rounded-2xl border border-white/10 bg-[#0c0d0f] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-white/88">{trait.traitName}</h4>
                    <span className="score-tabular text-sm font-bold" aria-label={`${resultCopy.traitScore} ${trait.score}` } style={{ color: theme.accent }}>{trait.score}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/50">{trait.description}</p>
                  <p className="mt-3 border-l border-white/15 pl-3 text-xs leading-5 text-white/65">{trait.impact}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="result-card p-6 sm:p-8 lg:col-span-5">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold tracking-[-0.025em]">{insightCopy.lifestyle}</h3>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-white/28">02</span>
            </div>
            <ul className="space-y-4">
              {personalityAnalysis?.lifestyleInsights.map((insight, index) => (
                <li key={insight} className="grid grid-cols-[auto_1fr] gap-4 border-b border-white/8 pb-4 last:border-0 last:pb-0">
                  <span className="score-tabular text-xs font-bold" style={{ color: theme.accent }}>0{index + 1}</span>
                  <span className="text-sm leading-6 text-white/70">{insight}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="result-card p-6 sm:p-8 lg:col-span-12">
            <div className="mb-7 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold tracking-[-0.025em]">{insightCopy.music}</h3>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-white/28">03</span>
            </div>
            <p className="mb-6 text-xs leading-5 text-white/60">{resultCopy.metricNote}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {musicMetrics.map(metric => (
                <div key={metric.label}>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <span className="text-sm font-semibold text-white/58">{metric.label}</span>
                    <span className="score-tabular text-2xl font-bold tracking-[-0.04em]">{metric.value}<span className="text-xs text-white/35">%</span></span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${metric.value}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="next-listen" className="border-t border-white/10 bg-black/15">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="eyebrow mb-3">{resultCopy.nextTag}</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.next}</h2></div>
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
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{getGenreDescription(genre.id, genre.description, language)}</p>
                <div className="mt-5 flex flex-wrap gap-2">{getGenreCharacteristics(genre.id, genre.characteristics, language).slice(0, 2).map(value => <span key={value} className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">#{value}</span>)}</div>
              </article>
            );
          })}
        </div>
        </div>
      </section>

      {recommendedArtists.length > 0 && (
        <section className="border-y border-white/10 bg-white/[0.018]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <p className="eyebrow mb-3">{resultCopy.artistTag}</p>
            <h2 className="mb-8 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.artists}</h2>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedArtists.map((recommendation, index) => (
                <article key={`${recommendation.artist.name}-${index}`} className="bg-[#0d0d0f] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="font-bold">{getArtistName(recommendation.artist, language)}</h3><p className="mt-1 text-xs text-white/65">{getArtistSubtitle(recommendation.artist, language)}</p></div>
                    <span className="score-tabular text-right text-xs font-bold text-white/70">{recommendation.compatibility}%<small className="block text-[9px] font-medium">{resultCopy.genreMatch}</small></span>
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">{albumCopy[recommendation.artist.role]}</p>
                    <p className="mt-2 text-base font-semibold leading-6 text-white/82">{recommendation.artist.album.title}</p>
                    <p className="mt-1 text-xs text-white/65">{recommendation.artist.album.year}{recommendation.artist.album.credit ? ` · ${recommendation.artist.album.credit}` : ''}</p>
                    <a href={recommendation.artist.album.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${getArtistName(recommendation.artist, language)} · ${recommendation.artist.album.title}: ${albumCopy.listen}`} onClick={() => analytics.track('music_link_click', { provider: 'spotify', contentType: 'album', artist: recommendation.artist.name, album: recommendation.artist.album.title, genre: recommendation.genreName, compatibility: recommendation.compatibility, context: 'results' })} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#1ed760] px-4 text-xs font-bold text-black transition-transform hover:-translate-y-0.5">
                      {albumCopy.listen}<ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {personalityAnalysis && (
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <details open data-testid="personality-deep-dive" className="result-card group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 sm:p-8">
              <div><p className="eyebrow mb-2">{resultCopy.deepTag}</p><h2 className="text-2xl font-bold tracking-[-0.03em]">{resultCopy.detail}</h2></div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition-transform group-open:rotate-180"><ArrowDown size={18} /></span>
            </summary>
            <div className="border-t border-white/10 p-6 sm:p-8">
              <h3 className="text-2xl font-bold">{personalityAnalysis.typeTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">{personalityAnalysis.description}</p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                <h4 className="font-bold">{t('results.recommendationReason')}</h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">{topRecommendation.reasoning.map(item => <li key={item}>• {item}</li>)}</ul>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div><h4 className="eyebrow mb-3">{t('analysisReport.strengths')}</h4><ul className="space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.strengths.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
                <div><h4 className="eyebrow mb-3">{t('analysisReport.challenges')}</h4><ul className="space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.challenges.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
              </div>
              <div className="mt-8 border-t border-white/10 pt-7">
                <h4 className="font-bold">{resultCopy.relationship}</h4>
                <p className="mt-3 text-sm leading-7 text-white/65">{personalityAnalysis.relationshipCompatibility}</p>
              </div>
              <div className="mt-8 grid gap-7 border-t border-white/10 pt-7 sm:grid-cols-2">
                <div><h4 className="font-bold">{resultCopy.preferences}</h4><ul className="mt-4 space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.musicPreferences.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
                <div><h4 className="font-bold">{resultCopy.activities}</h4><ul className="mt-4 space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.recommendedActivities.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
              </div>
              <div className="mt-8 grid gap-7 border-t border-white/10 pt-7 sm:grid-cols-2">
                <div><h4 className="font-bold">{resultCopy.contexts}</h4><ul className="mt-4 space-y-2 text-sm leading-6 text-white/65">{topRecommendation.detailedMatch.listeningContexts.map(item => <li key={item}>• {item}</li>)}</ul></div>
                {topRecommendation.detailedMatch.potentialGrowthAreas.length > 0 && <div><h4 className="font-bold">{resultCopy.growth}</h4><ul className="mt-4 space-y-2 text-sm leading-6 text-white/65">{topRecommendation.detailedMatch.potentialGrowthAreas.map(item => <li key={item}>• {item}</li>)}</ul></div>}
              </div>
              {compatibleTypes.length > 0 && <div className="mt-8 border-t border-white/10 pt-7">
                <h4 className="font-bold">{resultCopy.compatible}</h4>
                <p className="mt-2 text-xs leading-5 text-white/70">{resultCopy.exploreNote}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {compatibleTypes.map(item => <div key={`${item.compatibilityType}-${item.personalityType}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-bold">{item.personalityType}</p>
                    <p className="mt-1 text-xs font-semibold" style={{ color: theme.accent }}>{getGenreName(item.representativeGenre, language)}</p>
                    <p className="mt-3 text-xs leading-5 text-white/70">{item.description}</p>
                    <p className="mt-3 text-xs leading-5 text-white/65">{item.compatibilityReason}</p>
                  </div>)}
                </div>
              </div>}
            </div>
          </details>
        </section>
      )}

      <section id="share" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-8 text-center"><p className="eyebrow mb-3">{resultCopy.shareTag}</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{t('results.shareResults')}</h2><p className="mt-4 text-sm text-white/70">{t('results.shareDescription')}</p></div>
          <ShareableCard personalityScores={personalityScores} topGenre={topGenre} topGenreScore={Math.round(topRecommendation.compatibility)} />
          {onRestart && <div className="mt-8 text-center"><button onClick={onRestart} className="secondary-action !w-auto inline-flex items-center gap-2"><RotateCcw size={17} />{resultCopy.again}</button></div>}
        </div>
      </section>

      {shareFeedback && (
        <div className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:hidden" role="status" aria-live="polite">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#111216]/95 px-4 py-2 text-xs text-white/72 shadow-2xl backdrop-blur-xl"><Check size={14} style={{ color: theme.accent }} />{shareFeedback}</span>
        </div>
      )}
      {showStickyActions && (
        <div data-testid="mobile-result-actions" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-2 gap-2 rounded-[22px] border border-white/12 bg-[#090a0d]/92 p-2 shadow-2xl backdrop-blur-xl sm:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => void shareResultLink()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold text-black" style={{ background: theme.accent }}><Share2 size={16} />{resultCopy.share}</button>
          {onInviteFriend ? <button onClick={onInviteFriend} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-3 text-xs font-bold text-white"><Users size={16} />{resultCopy.invite}</button> : <a href="#share" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-3 text-xs font-bold text-white">{resultCopy.share}</a>}
        </div>
      )}
    </main>
  );
};

export default PersonalityResults;
