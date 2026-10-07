'use client';

import React, { CSSProperties, lazy, useEffect, useState } from 'react';
import { ArrowDown, ExternalLink, Music2, RotateCcw, Share2, Users } from 'lucide-react';
import { MUSICPersonality, EnhancedRecommendationScore, GenreSchema, RecommendedArtist } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGenreDescription, getGenreCharacteristics, getPersonalityAnalysis, getGenreName, getArtistName, getArtistSubtitle } from '@/lib/genreTranslations';
import { analytics } from '@/lib/analytics';
import { getGenreTheme } from '@/lib/resultTheme';
import { openResultShareMenu } from './ui/ShareActions';
import { getCompatiblePersonalityTypes } from '@/lib/musicCalculations';
import { getGenreSound, getResultIdentityCopy } from '@/lib/resultIdentity';
import { getPersonalizedResultSummary } from '@/lib/resultNarrative';
import { interpretResult, resultInterpretationCopy, exploratoryIdentity } from '@/lib/resultInterpretation';
import { CURRENT_RESULT_VERSION, type ResultVersion } from '@/lib/resultVersion';
import { artistRecommendationAlternatives, rotateArtistRecommendation } from '@/lib/artistRecommendations';
import AnimatedSection from './ui/AnimatedSection';
import ShareableCard from './ui/ShareableCard';
import ResultMatchStory from './ResultMatchStory';
import ResultFeedback from './ResultFeedback';
import ResultSectionLink from './ui/ResultSectionLink';

const MUSICRadarChart = lazy(() => import('./ui/charts/MUSICRadarChart'));

interface PersonalityResultsProps {
  personalityScores: MUSICPersonality;
  recommendedGenres: EnhancedRecommendationScore[];
  genres: GenreSchema[];
  recommendedArtists?: RecommendedArtist[];
  resultVersion?: ResultVersion;
  onRestart?: () => void;
  onInviteFriend?: () => void;
}

const PersonalityResults: React.FC<PersonalityResultsProps> = ({ personalityScores, recommendedGenres, genres, recommendedArtists = [], resultVersion = CURRENT_RESULT_VERSION, onRestart, onInviteFriend }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showStickyActions, setShowStickyActions] = useState(false);
  const [artistSelection, setArtistSelection] = useState<{ context: string; picks: RecommendedArtist[]; changedIndex: number } | null>(null);
  // Selections are local to this visible result. Returning to a link restores
  // its deterministic base picks; it never changes scores, URL, or saved results.
  const artistContext = JSON.stringify([language, resultVersion, personalityScores, recommendedArtists]);
  const displayedArtists = artistSelection?.context === artistContext ? artistSelection.picks : recommendedArtists;
  const topRecommendation = recommendedGenres[0];
  const topGenre = genres.find(genre => genre.id === topRecommendation?.genreId);
  const nearbyGenres = recommendedGenres.slice(1, 4).filter(recommendation => topRecommendation && topRecommendation.compatibility - recommendation.compatibility <= 3);
  const theme = getGenreTheme(topGenre);
  const personalityAnalysis = topGenre?.personalityAnalysis
    ? getPersonalityAnalysis(topGenre.id, topGenre.personalityAnalysis, language, topGenre.characteristics)
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
  const interpretation = interpretResult(personalityScores, genres, resultVersion);
  const interpretationCopy = resultInterpretationCopy(interpretation.kind, language);
  const identity = interpretation.tentative ? { ...identityCopy, ...exploratoryIdentity(language) } : identityCopy;
  const genreSound = getGenreSound(topGenre.id, language);
  const personalizedSummary = getPersonalizedResultSummary(personalityScores, topGenre.personalityProfile, language);
  const compatibleTypes = getCompatiblePersonalityTypes(personalityScores, genres, language);
  const resultCopy = language === 'ko'
    ? { eyebrow: '당신의 음악 성격', lead: '당신과 가장 닮은 장르', match: '장르 유사도', spectrum: '나의 취향 스펙트럼', spectrumBody: '다섯 개의 축이 당신의 음악 취향을 어떻게 구성하는지 보여줍니다.', next: '함께 들으면 좋은 장르', artists: '당신을 위한 아티스트와 곡', detail: '성격 해석', invite: '친구와 음악 궁합 보기', share: '결과 공유하기', again: '다시 검사하기', genreProfile: '가장 닮은 장르를 사람에 빗댄 읽을거리예요. 실제 성격을 측정한 결과는 아닙니다.', metricNote: '이 수치는 내 검사 점수가 아닌 추천 장르의 사운드 프로필입니다.', traitScore: '장르 특성 점수', relationship: '관계에서의 모습', preferences: '어울리는 음악', activities: '해볼 만한 활동', compatible: '함께 탐색할 장르', exploreNote: '관계 궁합이 아니라, 다른 음악 취향을 발견하기 위한 아이디어예요.', contexts: '이럴 때 들어보세요', growth: '새롭게 탐험할 지점', genreMatch: '장르 유사도', card: '결과 카드', nextTag: '다음에 들을 음악', artistTag: '곡 추천', deepTag: '더 깊이 보기', shareTag: '결과 보여주기', nearTie: '비슷하게 어울리는 장르', shortNote: '다섯 취향 축의 프로필 비교 · 좋아할 확률 아님' }
    : language === 'ja'
      ? { eyebrow: 'あなたの音楽性格', lead: 'あなたに最も似たジャンル', match: 'ジャンル一致度', spectrum: 'あなたの好みスペクトル', spectrumBody: '五つの軸から、音楽の好みの組み合わせが見えてきます。', next: '次に試したいジャンル', artists: 'あなたへのアーティストと曲', detail: '性格メモ', invite: '友達と音楽相性を見る', share: '結果をシェア', again: 'もう一度テスト', genreProfile: '最も近いジャンルを人にたとえた読み物です。実際の性格を測定した結果ではありません。', metricNote: 'これらはおすすめジャンルのサウンド特性で、あなたの回答スコアではありません。', traitScore: 'ジャンル特性スコア', relationship: '人間関係での傾向', preferences: 'おすすめの音', activities: '試してみたいこと', compatible: '一緒に探したいジャンル', exploreNote: '人間関係の予測ではなく、新しい音楽に出会うためのヒントです。', contexts: 'こんな時に聴いてみて', growth: '新しく探索するポイント', genreMatch: 'ジャンル一致度', card: '結果カード', nextTag: '次に聴く音楽', artistTag: '曲の提案', deepTag: 'もっと深く', shareTag: '結果を見せる', nearTie: '同じくらい近いジャンル', shortNote: '五つの好み軸の比較 · 好きになる確率ではありません' }
      : { eyebrow: 'YOUR MUSIC PERSONALITY', lead: 'The genre most like you', match: 'genre similarity', spectrum: 'Your taste spectrum', spectrumBody: 'Five dimensions show how your music taste is put together.', next: 'Genres to try next', artists: 'Artists and tracks for your taste', detail: 'Personality notes', invite: 'Compare with a friend', share: 'Share my result', again: 'Take it again', genreProfile: 'A playful personification of your closest genre, not a measurement of your actual personality.', metricNote: 'These are the recommended genre’s sound attributes, not your survey scores.', traitScore: 'Genre profile score', relationship: 'Relationships', preferences: 'Music to try', activities: 'Activities to try', compatible: 'Other genres to explore', exploreNote: 'These are discovery ideas, not predictions of relationship compatibility.', contexts: 'Good moments to listen', growth: 'A different sound to discover', genreMatch: 'Genre similarity', card: 'RESULT CARD', nextTag: 'NEXT LISTEN', artistTag: 'TRACK PICKS', deepTag: 'DEEP DIVE', shareTag: 'SHOW YOUR RESULT', nearTie: 'Also close to your taste', shortNote: 'Five-dimension profile match · not a liking probability' };
  const analysisCaveat = language === 'ko'
    ? '장르의 분위기를 사람에 빗댄 이야기예요. 아래 특성·관계·라이프스타일은 실제 성격을 측정한 결과가 아닙니다.'
    : language === 'ja'
      ? 'ジャンルの雰囲気を人にたとえた読み物です。以下の特徴や人間関係、暮らし方は実際の性格を測った結果ではありません。'
      : 'These notes personify a genre. The traits, relationships, and lifestyle ideas below are not measured facts about your personality.';
  const characterCopy = language === 'ko'
    ? { strengths: '이 음악 캐릭터의 매력', challenges: '이 캐릭터의 다른 면', relationship: '친구와 나눌 음악 이야기' }
    : language === 'ja'
      ? { strengths: 'この音楽キャラクターの魅力', challenges: 'もう一つの側面', relationship: '友達と話したい音楽のこと' }
      : { strengths: 'What this music character brings', challenges: 'Another side of the character', relationship: 'Music to talk about with a friend' };
  const trackCopy = language === 'ko'
    ? { anchor: '들어봤을 대표곡', discovery: '새롭게 발견할 곡', bridge: '장르를 잇는 한 곡', listen: 'Spotify에서 곡 듣기', anotherTrack: '같은 장르의 다른 곡', anotherScene: '다른 장면의 곡', changeNote: '다른 곡을 골라도 검사 결과와 각 장르의 유사도는 바뀌지 않아요.', changed: '추천곡을 바꿨어요:' }
    : language === 'ja'
      ? { anchor: '知っているかも', discovery: '新しく出会う曲', bridge: 'ジャンルをつなぐ一曲', listen: 'Spotifyで曲を聴く', anotherTrack: '同じジャンルの別の曲', anotherScene: '別のシーンの曲', changeNote: '別の曲を選んでも、テスト結果と各ジャンルの一致度は変わりません。', changed: 'おすすめの曲を変更しました：' }
      : { anchor: 'A familiar starting point', discovery: 'A new discovery', bridge: 'A bridge to another scene', listen: 'Listen to the track on Spotify', anotherTrack: 'Another track in this genre', anotherScene: 'Another scene to try', changeNote: 'Changing a track does not change your result or the similarity score for each genre.', changed: 'Changed your track pick:' };
  const changedArtist = artistSelection?.context === artistContext ? displayedArtists[artistSelection.changedIndex]?.artist : undefined;
  const recordingCreditLabel = language === 'ko' ? '녹음 크레딧' : language === 'ja' ? '録音クレジット' : 'Recording credits';
  const changeArtist = (index: number) => {
    setArtistSelection(current => {
      const picks = current?.context === artistContext ? current.picks : recommendedArtists;
      const next = rotateArtistRecommendation(picks, index);
      return next === picks ? current : { context: artistContext, picks: next, changedIndex: index };
    });
  };
  const insightCopy = language === 'ko'
    ? { eyebrow: '성격 해석', title: '취향이 닮은 음악 캐릭터', core: '핵심 특성', lifestyle: '라이프스타일 통찰', music: '추천 장르의 사운드', popularity: '인기도', energy: '에너지', valence: '긍정성', acousticness: '어쿠스틱' }
    : language === 'ja'
      ? { eyebrow: '性格メモ', title: '好みに似た音楽キャラクター', core: '核心的な特徴', lifestyle: 'ライフスタイルのヒント', music: 'おすすめジャンルのサウンド', popularity: '人気度', energy: 'エネルギー', valence: 'ポジティブ度', acousticness: 'アコースティック' }
      : { eyebrow: 'PERSONALITY NOTES', title: 'A music character close to your taste', core: 'Core traits', lifestyle: 'Lifestyle insights', music: 'Recommended genre sound', popularity: 'Popularity', energy: 'Energy', valence: 'Positivity', acousticness: 'Acoustic' };
  const musicMetrics = [
    { label: insightCopy.popularity, value: topGenre.popularity },
    { label: insightCopy.energy, value: topGenre.energy },
    { label: insightCopy.valence, value: topGenre.valence },
    { label: insightCopy.acousticness, value: topGenre.acousticness },
  ];
  const navigationCopy = language === 'ko'
    ? { label: '결과 빠르게 둘러보기', character: '음악 캐릭터', music: '추천 음악', share: '공유 카드' }
    : language === 'ja'
      ? { label: '結果のセクションへ移動', character: '音楽キャラクター', music: 'おすすめの音楽', share: 'シェアカード' }
      : { label: 'Explore your result', character: 'Music character', music: 'Music picks', share: 'Share card' };
  const resultSections: { href: `#${string}`; label: string }[] = [
    { href: '#spectrum', label: 'MUSIC 5' },
    { href: '#music-character', label: navigationCopy.character },
    { href: displayedArtists.length > 0 ? '#track-picks' : '#next-listen', label: navigationCopy.music },
    { href: '#share', label: navigationCopy.share },
  ];

  return (
    <main className="result-surface min-h-screen pb-[calc(7rem_+_env(safe-area-inset-bottom))] text-white sm:pb-0" style={pageStyle}>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <AnimatedSection direction="fade" duration={0.45}>
          <div className="mb-12 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold tracking-[-0.03em]">MUTI</p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/60">{resultCopy.card}</p>
            </div>
            {onRestart && <button onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><RotateCcw size={15} />{resultCopy.again}</button>}
          </div>

          <div className="grid min-w-0 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
            <div className="min-w-0">
              <p className="eyebrow mb-5" style={{ color: theme.accent }}>{interpretation.tentative ? interpretationCopy.badge : resultCopy.eyebrow}</p>
              <h1 className="max-w-4xl min-w-0 font-extrabold tracking-[-0.06em]">
                <span className="block text-sm font-semibold tracking-[-0.02em] text-white/65 sm:text-base">{identity.opening}</span>
                <span className="mt-3 block text-[clamp(2.55rem,10vw,6.6rem)] leading-[1.05] [overflow-wrap:anywhere]">
                  <span style={{ color: theme.accent }}>{identityCopy.quoteOpen}{getGenreName(topGenre, language)}{identityCopy.quoteClose}</span>{identity.ending && <span className={`${language === 'ko' ? 'ml-1' : ''} text-[0.43em] align-baseline tracking-[-0.04em] text-white`}>{identity.ending}</span>}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl leading-tight">
                <span className="block text-base font-medium leading-7 text-white/70 sm:text-lg">{interpretation.tentative ? `${exploratoryIdentity(language).sound} · ${genreSound}` : language === 'en' ? `${identityCopy.affinity} ${genreSound},` : `${genreSound}${identityCopy.affinity}`}</span>
                <strong className="mt-1 block text-[clamp(1.6rem,5.8vw,2.8rem)] font-extrabold leading-[1.18] tracking-[-0.04em] [overflow-wrap:anywhere]">{typeTitle}</strong>
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/[0.035] p-5 sm:p-6 lg:pb-6">
              <p className="score-tabular text-7xl font-extrabold tracking-[-0.07em] sm:text-8xl" style={{ color: theme.accent }}>{topRecommendation.compatibility}<span className="text-2xl">%</span></p>
              <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">{resultCopy.match}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/70">{resultCopy.shortNote}</p>
              {nearbyGenres.length > 0 && <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/70">{resultCopy.nearTie}: {nearbyGenres.map((item, index) => {
                const genre = genres.find(candidate => candidate.id === item.genreId);
                return genre ? <React.Fragment key={genre.id}>{index > 0 ? ' · ' : ''}<ResultSectionLink href="#next-listen" className="underline underline-offset-2">{getGenreName(genre, language)} {item.compatibility}%</ResultSectionLink></React.Fragment> : null;
              })}</p>}
            </div>
          </div>

          {interpretation.tentative && <p data-testid="result-interpretation" data-kind={interpretation.kind} className="mt-6 max-w-3xl rounded-2xl border border-white/12 bg-white/[0.035] px-5 py-4 text-sm leading-7 text-white/75">{interpretationCopy.note}</p>}

          <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1.25fr_.75fr]">
            <p className="max-w-[44ch] text-base leading-8 text-white/75 sm:text-lg">{personalizedSummary}</p>
            <div className="flex flex-wrap content-start gap-2 lg:justify-end">
              {traits.map(trait => <span key={trait} className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/68">{trait}</span>)}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button aria-haspopup="dialog" onClick={event => openResultShareMenu('personal', event.currentTarget)} className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{resultCopy.share}</button>
            <ResultSectionLink href="#spectrum" className="secondary-action inline-flex items-center justify-center gap-2">{resultCopy.spectrum}<ArrowDown size={17} /></ResultSectionLink>
            {onInviteFriend && <button onClick={onInviteFriend} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white/70 transition-colors hover:text-white"><Users size={16} />{resultCopy.invite}</button>}
          </div>
          <nav aria-label={navigationCopy.label} className="mt-6 flex flex-wrap gap-2">
            {resultSections.map((item, index) => <ResultSectionLink key={item.href} href={item.href} className="ui-chip !min-h-11 gap-2 !text-xs"><span aria-hidden="true" className="score-tabular text-[10px] text-white/40">0{index + 1}</span>{item.label}</ResultSectionLink>)}
          </nav>
          <ResultMatchStory scores={personalityScores} genre={topGenre} accent={theme.accent} resultVersion={resultVersion} />
        </AnimatedSection>
      </section>

      <section id="spectrum" tabIndex={-1} className="scroll-mt-6 border-y border-white/10 bg-black/15 focus:!outline-none">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:py-24">
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

      <section id="music-character" tabIndex={-1} className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12 sm:px-8 lg:py-24 focus:!outline-none">
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
                <div key={trait.traitName} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-white/88">{trait.traitName}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70">{trait.description}</p>
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
            <div className="grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
              {musicMetrics.map(metric => (
                <div key={metric.label} className="min-w-0">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <span className="text-xs font-semibold leading-5 text-white/70 sm:text-sm">{metric.label}</span>
                    <span className="score-tabular text-2xl font-bold tracking-[-0.04em]">{metric.value}<span className="text-xs text-white/35">%</span></span>
                  </div>
                  <div role="meter" aria-label={`${insightCopy.music} · ${metric.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.value} className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${metric.value}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="next-listen" tabIndex={-1} className="scroll-mt-6 border-t border-white/10 bg-black/15 focus:!outline-none">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="eyebrow mb-3">{resultCopy.nextTag}</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.next}</h2></div>
          <p className="hidden text-xs text-white/30 sm:block">TOP 06</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedGenres.slice(0, 6).map((recommendation, index) => {
            const genre = genres.find(item => item.id === recommendation.genreId);
            if (!genre) return null;
            return (
              <article key={genre.id} className={`result-card flex min-w-0 flex-col p-5 ${index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`} style={index === 0 ? { borderColor: `${theme.accent}55`, background: `linear-gradient(145deg, ${theme.accent}0c, transparent)` } : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <span className="score-tabular text-xs text-white/28">0{index + 1}</span>
                  <span className="score-tabular text-sm font-bold" style={{ color: index === 0 ? theme.accent : 'rgba(255,255,255,.55)' }}>{recommendation.compatibility}%</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-[-0.035em]">{getGenreName(genre, language)}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{getGenreDescription(genre.id, genre.description, language)}</p>
                <div className="mt-5 flex flex-wrap gap-2">{getGenreCharacteristics(genre.id, genre.characteristics, language).slice(0, 2).map(value => <span key={value} className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">#{value}</span>)}</div>
              </article>
            );
          })}
        </div>
        </div>
      </section>

      {displayedArtists.length > 0 && (
        <section id="track-picks" tabIndex={-1} className="scroll-mt-6 border-y border-white/10 bg-white/[0.018] focus:!outline-none">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-24">
            <p className="eyebrow mb-3">{resultCopy.artistTag}</p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{resultCopy.artists}</h2>
            <p id="personal-track-change-note" className="mt-4 max-w-2xl text-sm leading-6 text-white/65">{trackCopy.changeNote}</p>
            <p data-testid="personal-track-status" role="status" aria-live="polite" className="mb-5 mt-3 min-h-6 text-xs leading-6 text-white/75">{changedArtist ? `${trackCopy.changed} ${getArtistName(changedArtist, language)} · ${changedArtist.track.title}` : ''}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedArtists.map((recommendation, index) => {
                const canChange = artistRecommendationAlternatives(displayedArtists, index).length > 1;
                return (
                <article key={index} data-testid={`personal-track-${index}`} data-track-role={recommendation.artist.role} className="result-card flex min-w-0 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <p className="max-w-[22ch] text-[10px] font-bold leading-5 tracking-[0.06em]" style={{ color: theme.accent }}>{trackCopy[recommendation.artist.role]}</p>
                    <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55"><Music2 size={14} /></span>
                  </div>
                  <div className="flex flex-1 flex-col pt-5">
                    <h3 id={`personal-track-title-${index}`} className="text-xl font-bold leading-snug tracking-[-0.025em] [overflow-wrap:anywhere]">{recommendation.artist.track.title}</h3>
                    <p className="mt-3 text-sm font-semibold text-white/85">{getArtistName(recommendation.artist, language)}</p>
                    <p className="mt-1 text-xs leading-5 text-white/60">{getArtistSubtitle(recommendation.artist, language)}</p>
                    {recommendation.artist.album.credit && <p data-testid="personal-recording-credit" className="mt-2 text-[11px] leading-5 text-white/60 [overflow-wrap:anywhere]">{recordingCreditLabel}: {recommendation.artist.album.credit}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-white/65"><span>{recommendation.genreName}</span><span aria-hidden="true">·</span><span className="score-tabular">{recommendation.artist.track.year}</span></div>
                    <p className="score-tabular mt-1 text-[11px] text-white/60">{resultCopy.genreMatch} {recommendation.compatibility}%</p>
                    <p className="mb-6 mt-4 text-xs leading-6 text-white/70">{recommendation.reason}</p>
                    <a href={recommendation.artist.track.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${getArtistName(recommendation.artist, language)} · ${recommendation.artist.track.title}: ${trackCopy.listen}`} onClick={() => analytics.track('music_link_click', { provider: 'spotify', contentType: 'track', artist: recommendation.artist.name, track: recommendation.artist.track.title, genre: recommendation.genreName, compatibility: recommendation.compatibility, context: 'results' })} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-4 py-3 text-xs font-bold leading-5 text-black transition-colors hover:bg-[#42e67b]">
                      {trackCopy.listen}<ExternalLink size={12} />
                    </a>
                    {canChange && <button type="button" aria-describedby={`personal-track-title-${index} personal-track-change-note`} onClick={() => changeArtist(index)} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-xs font-semibold leading-5 text-white/75 transition-colors hover:bg-white/10 hover:text-white [overflow-wrap:anywhere]"><RotateCcw aria-hidden="true" size={13} className="shrink-0" />{recommendation.artist.role === 'bridge' ? trackCopy.anotherScene : trackCopy.anotherTrack}</button>}
                  </div>
                </article>
              );})}
            </div>
          </div>
        </section>
      )}

      {personalityAnalysis && (
        <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-24">
          <details open data-testid="personality-deep-dive" className="result-card group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 sm:p-8">
              <div><p className="eyebrow mb-2">{resultCopy.deepTag}</p><h2 className="text-2xl font-bold tracking-[-0.03em]">{resultCopy.detail}</h2></div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition-transform group-open:rotate-180"><ArrowDown size={18} /></span>
            </summary>
            <div className="border-t border-white/10 p-6 sm:p-8">
              <p className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white/70">{analysisCaveat}</p>
              <h3 className="text-2xl font-bold">{personalityAnalysis.typeTitle}</h3>
              <p className="mt-4 max-w-[65ch] text-sm leading-7 text-white/72">{personalityAnalysis.description}</p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                <h4 className="font-bold">{t('results.recommendationReason')}</h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">{topRecommendation.reasoning.map(item => <li key={item}>• {item}</li>)}</ul>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div><h4 className="eyebrow mb-3">{characterCopy.strengths}</h4><ul className="space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.strengths.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
                <div><h4 className="eyebrow mb-3">{characterCopy.challenges}</h4><ul className="space-y-3 text-sm leading-6 text-white/65">{personalityAnalysis.challenges.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul></div>
              </div>
              <div className="mt-8 border-t border-white/10 pt-7">
                <h4 className="font-bold">{characterCopy.relationship}</h4>
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

      <section id="share" tabIndex={-1} className="scroll-mt-6 border-t border-white/10 bg-black/20 focus:!outline-none">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-24">
          <div className="mb-8 text-center"><p className="eyebrow mb-3">{resultCopy.shareTag}</p><h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{t('results.shareResults')}</h2><p className="mt-4 text-sm text-white/70">{t('results.shareDescription')}</p></div>
          <ShareableCard personalityScores={personalityScores} topGenre={topGenre} topGenreScore={Math.round(topRecommendation.compatibility)} resultVersion={resultVersion} interpretationKind={interpretation.kind} />
          <ResultFeedback key={`${resultVersion}:${Object.values(personalityScores).join('.')}`} context={{ kind: 'personal', genres: [getGenreName(topGenre, language)], versions: [resultVersion], tracks: displayedArtists.map(({ artist }) => `${getArtistName(artist, language)} · ${artist.track.title}`) }} />
          {onRestart && <div className="mt-8 text-center"><button onClick={onRestart} className="secondary-action !w-auto inline-flex items-center gap-2"><RotateCcw size={17} />{resultCopy.again}</button></div>}
        </div>
      </section>

      {showStickyActions && (
        <div data-testid="mobile-result-actions" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-2 gap-2 rounded-[22px] border border-white/12 bg-[#090a0d]/92 p-2 shadow-2xl backdrop-blur-xl sm:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <button aria-haspopup="dialog" onClick={event => openResultShareMenu('personal', event.currentTarget)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold text-black" style={{ background: theme.accent }}><Share2 size={16} />{resultCopy.share}</button>
          {onInviteFriend ? <button onClick={onInviteFriend} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-3 text-xs font-bold text-white"><Users size={16} />{resultCopy.invite}</button> : <ResultSectionLink href="#share" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-3 text-xs font-bold text-white">{resultCopy.share}</ResultSectionLink>}
        </div>
      )}
    </main>
  );
};

export default PersonalityResults;
