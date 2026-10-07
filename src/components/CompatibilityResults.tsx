'use client';

import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, Music2, RefreshCw, Sparkles, Users } from 'lucide-react';
import { GenreSchema, MUSICPersonality, MusicCatalog } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculatePairCompatibility, encodeScores, getComparisonUrl } from '@/lib/compatibility';
import { recommendGenres } from '@/lib/musicCalculations';
import { getArtistName, getArtistSubtitle, getGenreDescription, getGenreName, getPersonalityAnalysis } from '@/lib/genreTranslations';
import { pairTrackAlternatives, rankPairGenres, recommendPairTracks, rotatePairTrack, type PairTrackPick } from '@/lib/compatibilityTracks';
import { getGenreTheme } from '@/lib/resultTheme';
import { analytics } from '@/lib/analytics';
import LanguageSelector from '@/components/LanguageSelector';
import { useCardSharing } from '@/hooks/useCardSharing';
import ShareActions from '@/components/ui/ShareActions';
import ResultSectionLink from '@/components/ui/ResultSectionLink';
import ResultFeedback from '@/components/ResultFeedback';
import type { ResultVersion } from '@/lib/resultVersion';
import { buildPairNarrative, pairLabels, pairTrackReason, SHARED_GENRE_MINIMUM } from '@/lib/pairNarrative';

interface CompatibilityResultsProps {
  hostScores: MUSICPersonality;
  guestScores: MUSICPersonality;
  hostVersion: ResultVersion;
  guestVersion: ResultVersion;
  genres: GenreSchema[];
  musicCatalog: MusicCatalog;
  onViewResult: (participant: 'host' | 'guest') => void;
  onCreateInvite: (participant: 'host' | 'guest') => void;
  onRestart: () => void;
}

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ hostScores, guestScores, hostVersion, guestVersion, genres, musicCatalog, onViewResult, onCreateInvite, onRestart }) => {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const compatibility = useMemo(() => calculatePairCompatibility(hostScores, guestScores, language), [guestScores, hostScores, language]);
  const hostRecommendation = useMemo(() => recommendGenres(hostScores, genres, language, hostVersion)[0], [genres, hostScores, hostVersion, language]);
  const guestRecommendation = useMemo(() => recommendGenres(guestScores, genres, language, guestVersion)[0], [genres, guestScores, guestVersion, language]);
  const jointRecommendations = useMemo(() => rankPairGenres(hostScores, guestScores, genres).slice(0, 3), [genres, guestScores, hostScores]);
  const initialPairTracks = useMemo(() => recommendPairTracks(hostScores, guestScores, genres, musicCatalog, hostVersion, guestVersion), [hostScores, guestScores, genres, musicCatalog, hostVersion, guestVersion]);
  const selectionKey = `${encodeScores(hostScores)}:${hostVersion}:${encodeScores(guestScores)}:${guestVersion}:${musicCatalog.version}`;
  const [trackSelection, setTrackSelection] = useState<{ key: string; picks: PairTrackPick[]; changedIndex: number } | null>(null);
  const pairTracks = trackSelection?.key === selectionKey ? trackSelection.picks : initialPairTracks;
  const rotateTrack = (index: number) => setTrackSelection(previous => {
    const picks = previous?.key === selectionKey ? previous.picks : initialPairTracks;
    const next = rotatePairTrack(picks, index, hostScores, guestScores, genres, musicCatalog, hostVersion, guestVersion);
    return next === picks ? previous : { key: selectionKey, picks: next, changedIndex: index };
  });
  const changedArtist = trackSelection?.key === selectionKey ? pairTracks[trackSelection.changedIndex]?.artist : undefined;
  const recordingCreditLabel = language === 'ko' ? '녹음 크레딧' : language === 'ja' ? '録音クレジット' : 'Recording credits';
  const changedTrackLabel = language === 'ko' ? '같이 들을 추천곡을 바꿨어요:' : language === 'ja' ? '一緒に聴く曲を変更しました：' : 'Changed your shared track pick:';
  const rotationCopy = language === 'ko'
    ? { button: '다른 곡으로 듣기', empty: '다른 추천곡 없음', note: '가까운 장르의 검수된 곡 안에서 바꿔볼 수 있어요. 점수는 그대로이며, 링크를 다시 열면 처음 추천곡이 보여요.' }
    : language === 'ja'
      ? { button: '別の曲を試す', empty: 'ほかの候補はありません', note: '近いジャンルの確認済みの曲に切り替えられます。スコアは変わりません。リンクを開き直すと最初の曲に戻ります。' }
      : { button: 'Try another track', empty: 'No other curated track', note: 'Try another curated track from nearby genres. Scores stay the same; reopening the link restores the initial picks.' };
  const hostGenre = genres.find(genre => genre.id === hostRecommendation?.genreId);
  const guestGenre = genres.find(genre => genre.id === guestRecommendation?.genreId);
  const narrative = useMemo(() => buildPairNarrative(compatibility, language), [compatibility, language]);
  const participants = pairLabels(language);
  const hostType = hostGenre?.personalityAnalysis ? getPersonalityAnalysis(hostGenre.id, hostGenre.personalityAnalysis, language).typeTitle : '';
  const guestType = guestGenre?.personalityAnalysis ? getPersonalityAnalysis(guestGenre.id, guestGenre.personalityAnalysis, language).typeTitle : '';
  const detailsCopy = language === 'ko'
    ? { advice: '함께 음악을 고르는 방법', explain: '이 축의 답변 읽기', types: '음악 캐릭터명은 장르를 의인화한 표현이며 실제 성격 진단이 아니에요.', profile: '장르 유사도', hostResult: '초대한 사람의 결과 보기', guestResult: '응답한 사람의 결과 보기', noDifference: '다섯 취향 모두 일치', mixed: '이전 문항으로 검사한 결과가 포함돼 있어요. 같은 다섯 축을 비교하지만 문항 표현이 달랐다는 점을 참고해 주세요.', discovery: '함께 시도할 발견곡', reason: '이 곡을 고른 이유', criteria: '공통점·발견곡 구분은 이해를 돕기 위한 편집 기준이며 통계적으로 검증된 기준이 아니에요.' }
    : language === 'ja'
      ? { advice: '一緒に曲を選ぶヒント', explain: 'この軸の回答を読む', types: 'キャラクター名はジャンルを人にたとえた表現で、性格診断ではありません。', profile: 'ジャンル一致度', hostResult: '招待した人の結果を見る', guestResult: '回答した人の結果を見る', noDifference: '五つの好みがすべて一致', mixed: '以前の設問による結果が含まれます。同じ五つの軸を比べますが、設問の表現は異なっていました。', discovery: '一緒に試す発見の曲', reason: 'この曲を選んだ理由', criteria: '共通点や発見の区分は読みやすくする編集上の基準で、統計的に検証された基準ではありません。' }
      : { advice: 'How to choose music together', explain: 'Read this axis', types: 'Character names personify genres; they are not personality diagnoses.', profile: 'Genre similarity', hostResult: 'View inviter result', guestResult: 'View respondent result', noDifference: 'All five scores align', mixed: 'An earlier questionnaire result is included. The same five axes are compared, but the question wording differed.', discovery: 'A discovery to try together', reason: 'Why this track', criteria: 'Common-ground and discovery categories are editorial reading aids, not statistically validated thresholds.' };
  const theme = getGenreTheme(guestGenre || hostGenre);
  const pageStyle = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;

  const copy = language === 'ko' ? {
    back: '처음으로', eyebrow: '우리의 음악 궁합', score: '두 사람의 취향 유사도', similar: '가장 닮은 취향', different: '가장 다른 취향', compare: '취향을 나란히 보기', friend: '친구', me: '나',
    together: '함께 시도할 장르', shareTitle: '이 궁합을 친구에게 보여주세요', shareBody: '결과 이미지를 저장하거나 링크로 공유하면 같은 화면을 다시 볼 수 있어요.', share: '결과 공유', save: '이미지 저장', copy: '링크 복사',
    myResult: '내 개인 결과 보기', another: '다른 친구와 비교하기', private: '점수는 공유 링크에 담기고 최근 궁합은 이 기기에 저장돼요. 로그인이나 결과 데이터베이스는 사용하지 않아요.', scoreNote: '다섯 음악 취향 점수의 평균 유사도예요. 관계의 성공 가능성을 뜻하지는 않습니다.', gap: '점 차이', match: '유사도', togetherTag: '함께 들을 음악', shareTag: '우리 결과 공유', cardTag: '우리의 음악 궁합', cardScore: '음악 취향 유사도', disclaimer: '재미로 보는 취향 비교 · 진단 아님',
  } : language === 'ja' ? {
    back: 'ホーム', eyebrow: '二人の音楽相性', score: '二人の音楽の好みの類似度', similar: '最も似ている好み', different: '最も違う好み', compare: '好みを並べて見る', friend: '友達', me: '私',
    together: '一緒に聴きたいジャンル', shareTitle: 'この相性を友達に見せよう', shareBody: '結果カードを保存するか、リンクをシェアすると同じ画面を開き直せます。', share: '結果をシェア', save: '画像を保存', copy: 'リンクをコピー',
    myResult: '自分の結果を見る', another: '別の友達と比べる', private: 'スコアは共有リンクに含まれ、最近の相性はこの端末に保存されます。ログインや結果データベースは使いません。', scoreNote: '五つの音楽の好みスコアの平均類似度です。人間関係の成功を予測するものではありません。', gap: '点差', match: '類似度', togetherTag: '一緒に聴く音楽', shareTag: '二人の結果をシェア', cardTag: '二人の音楽相性', cardScore: '音楽の好みの類似度', disclaimer: '気軽に楽しむ好み比較 · 診断ではありません',
  } : {
    back: 'Home', eyebrow: 'OUR MUSIC MATCH', score: 'Your music compatibility', similar: 'Closest match', different: 'Biggest contrast', compare: 'Taste, side by side', friend: 'Friend', me: 'Me',
    together: 'Genres to try together', shareTitle: 'Share this match with your friend', shareBody: 'Save the card or share the link to reopen the same result.', share: 'Share result', save: 'Save image', copy: 'Copy link',
    myResult: 'View my result', another: 'Compare with another friend', private: 'Scores travel in the share link; recent matches stay on this device. There is no login or results database.', scoreNote: 'This is the average similarity across five music taste scores, not a prediction about a relationship.', gap: 'point gap', match: 'match', togetherTag: 'LISTEN TOGETHER', shareTag: 'SHARE OUR MATCH', cardTag: 'OUR MUSIC MATCH', cardScore: 'TASTE COMPATIBILITY', disclaimer: 'FOR FUN · NOT A DIAGNOSIS',
  };
  const trackCopy = language === 'ko'
    ? { title: '같이 재생할 세 곡', note: '두 취향을 함께 살펴본 입문곡 하나와, 각자 소개할 곡 하나씩이에요. 아래 수치는 곡이 아닌 장르 프로필과의 유사도예요.', shared: '함께 시작할 곡', host: '초대한 사람의 소개곡', guest: '응답한 사람의 소개곡', listen: 'Spotify에서 함께 듣기' }
    : language === 'ja'
      ? { title: '一緒に聴く3曲', note: '二人の好みを見比べた入口の一曲と、それぞれが紹介する一曲ずつ。数値は曲ではなくジャンルとの近さを表します。', shared: '一緒に始める一曲', host: '招待した人の紹介曲', guest: '回答した人の紹介曲', listen: 'Spotifyで一緒に聴く' }
      : { title: 'Three tracks to try together', note: 'One starting point that considers both profiles, then one track each of you can introduce. The scores compare genre profiles, not individual songs.', shared: 'Start together', host: 'A track from the inviter', guest: 'A track from the respondent', listen: 'Listen together on Spotify' };
  const methodCopy = language === 'ko'
    ? { title: '궁합 점수와 해석 기준', body: '각 축의 유사도는 100에서 두 점수의 차이를 뺀 값이고, 전체 유사도는 다섯 축의 평균을 반올림한 값이에요. 해석에서는 차이 20점 이하를 가까운 응답, 35점 이하·65점 이상을 각각 낮은·높은 응답으로 구분해요. 함께 시작할 곡은 두 사람 모두 장르 유사도 60% 이상인 경우에만 그렇게 부르고, 아니라면 발견곡으로 안내해요. 이 구분은 설명을 위한 편집 기준이며 곡 선호나 관계를 예측하지 않아요.' }
    : language === 'ja'
      ? { title: '相性スコアと解釈の基準', body: '各軸は100から二人のスコア差を引き、全体は五つの軸の平均を四捨五入します。解釈では差が20点以内を近い回答、35点以下・65点以上を低め・高めと区分します。入口の曲は二人ともジャンル一致度60%以上の場合にそう呼び、それ以外は発見の曲と案内します。読みやすくする編集上の基準で、曲の好みや人間関係を予測するものではありません。' }
      : { title: 'How the match and interpretation work', body: 'Each axis is 100 minus the gap between the two scores. The overall match is the rounded average of the five axes. For reading aids, gaps of 20 or less are close; scores of 35 or less and 65 or more are low and high. A shared entry track requires both genre similarities to reach 60%; otherwise it is labeled a discovery. These are editorial categories, not predictions of song preference or relationships.' };

  const sharing = useCardSharing({
    cardRef, language, url: getComparisonUrl(hostScores, guestScores, language, { hostVersion, guestVersion }),
    title: language === 'ko' ? `우리 음악 궁합은 ${compatibility.score}%` : language === 'ja' ? `二人の音楽相性は${compatibility.score}％` : `Our music match is ${compatibility.score}%`,
    text: compatibility.title, accent: theme.accent, secondary: theme.secondary,
    filename: 'our-music-match.png', storyFilename: 'muti-match-story.png',
    onAction: shareType => analytics.track('compatibility_result_shared', { shareType, score: compatibility.score }),
  });
  const navigationCopy = language === 'ko'
    ? { label: '궁합 결과 빠르게 둘러보기', compare: '취향 비교', listen: '같이 들을 음악', share: '공유 카드' }
    : language === 'ja'
      ? { label: '相性結果のセクションへ移動', compare: '好みを比較', listen: '一緒に聴く音楽', share: 'シェアカード' }
      : { label: 'Explore your match', compare: 'Compare tastes', listen: 'Listen together', share: 'Share card' };

  return (
    <main className="result-surface min-h-screen text-white" style={pageStyle}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"><ArrowLeft size={15} />{copy.back}</button>
        <LanguageSelector />
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 text-center sm:px-8 sm:pt-12 lg:pb-24">
        <p className="eyebrow mb-5" style={{ color: theme.accent }}>{copy.eyebrow}</p>
        <p className="text-sm text-white/70">{copy.score}</p>
        <p className="score-tabular mt-2 text-[clamp(7rem,22vw,15rem)] font-extrabold leading-[.86] tracking-[-.085em]" style={{ color: theme.accent }}>{compatibility.score}<span className="text-[.22em]">%</span></p>
        <h1 className="mt-7 text-3xl font-bold tracking-[-.045em] sm:text-5xl">{compatibility.title}</h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-sm leading-7 text-white/72 sm:text-base">{compatibility.description}</p>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-white/70">{copy.scoreNote}</p>
        <details className="mx-auto mt-4 max-w-2xl text-left"><summary className="cursor-pointer py-2 text-center text-xs font-semibold text-white/70">{methodCopy.title}</summary><p className="rounded-2xl border border-white/10 bg-black/20 p-5 text-xs leading-6 text-white/70">{methodCopy.body}</p></details>
        {(hostVersion === 2 || guestVersion === 2) && <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-white/60">{detailsCopy.mixed}</p>}
        <nav aria-label={navigationCopy.label} className="mx-auto mt-7 flex max-w-3xl flex-wrap justify-center gap-2">
          {[{ href: '#pair-compare' as const, label: navigationCopy.compare }, { href: '#pair-listen' as const, label: navigationCopy.listen }, { href: '#pair-share' as const, label: navigationCopy.share }].map((item, index) => <ResultSectionLink key={item.href} href={item.href} className="ui-chip !min-h-11 gap-2 !text-xs"><span aria-hidden="true" className="score-tabular text-[10px] text-white/40">0{index + 1}</span>{item.label}</ResultSectionLink>)}
        </nav>

        <div data-testid="pair-identities" className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {([
            { person: 'host' as const, label: participants.host, genre: hostGenre, type: hostType, score: hostRecommendation?.compatibility, button: detailsCopy.hostResult },
            { person: 'guest' as const, label: participants.guest, genre: guestGenre, type: guestType, score: guestRecommendation?.compatibility, button: detailsCopy.guestResult },
          ]).map((item, index) => <article key={item.person} className="result-card flex min-w-0 flex-col p-6 text-left">
            <div className="flex items-center justify-between gap-4"><p className="eyebrow">{item.label}</p><span aria-hidden="true" className="score-tabular text-[10px] text-white/35">0{index + 1}</span></div>
            <h2 className="mt-4 break-words text-3xl font-extrabold tracking-[-.04em]" style={{ color: item.person === 'guest' ? theme.accent : undefined }}>{item.genre ? getGenreName(item.genre, language) : 'MUSIC TYPE'}</h2>
            <p className="mt-3 break-words text-lg font-bold text-white/85">{item.type}</p>
            <p className="score-tabular mb-5 mt-3 text-xs text-white/65">{detailsCopy.profile} {item.score}%</p>
            <button onClick={() => onViewResult(item.person)} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold leading-5 text-white/80 transition-colors hover:bg-white/10">{item.button}<ExternalLink size={13} className="shrink-0" /></button>
          </article>)}
        </div>
        <p className="mx-auto mt-3 max-w-3xl text-xs leading-5 text-white/60">{detailsCopy.types} {language === 'ko' ? '검사한 시기에 따라 문항 표현이 다를 수 있어요. 궁합은 저장된 다섯 취향 점수를 비교한 결과입니다.' : language === 'ja' ? '受けた時期によって設問の表現が異なることがあります。相性は保存された五つの好みのスコアの比較です。' : 'Question wording may vary with when the test was taken. The match compares the five saved taste scores.'}</p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <article data-testid="pair-shared-insight" className="result-card min-w-0 p-5 text-left"><p className="text-[10px] font-bold tracking-[.14em] text-white/65">{copy.similar}</p><h2 className="mt-3 break-words text-xl font-bold">{narrative.sharedTitle}</h2><p className="mt-3 text-sm leading-6 text-white/70">{narrative.sharedText}</p></article>
          <article data-testid="pair-contrast-insight" className="result-card min-w-0 p-5 text-left"><p className="text-[10px] font-bold tracking-[.14em] text-white/65">{narrative.identical ? detailsCopy.noDifference : copy.different}</p><h2 className="mt-3 break-words text-xl font-bold">{narrative.contrastTitle}</h2><p className="mt-3 text-sm leading-6 text-white/70">{narrative.contrastText}</p>{!narrative.identical && <p className="score-tabular mt-3 text-xs text-white/65">{compatibility.biggestDifference.difference} {copy.gap}</p>}</article>
        </div>
        <article data-testid="pair-listening-advice" className="result-card mx-auto mt-3 max-w-3xl p-6 text-left"><h2 className="font-bold">{detailsCopy.advice}</h2><p className="mt-3 text-sm leading-7 text-white/75">{narrative.advice}</p></article>
      </section>

      <section id="pair-compare" tabIndex={-1} className="scroll-mt-6 border-y border-white/10 bg-black/15 focus:!outline-none">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-24">
          <div className="mb-9"><p className="eyebrow mb-3">MUSIC 5 / COMPARE</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.compare}</h2></div>
          <div className="result-card p-5 sm:p-8">
            <div className="space-y-6">
              {compatibility.traits.map(trait => (
                <div key={trait.key} data-testid={`pair-trait-${trait.key}`} className="border-t border-white/10 pt-6 first:border-0 first:pt-0">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-white/90">{trait.label}</p><p className="score-tabular rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/70">{trait.similarity}% {copy.match}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0 rounded-xl bg-white/[0.035] p-3"><div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-2 gap-y-1"><span className="text-[11px] leading-5 text-white/70">{participants.host}</span><span className="score-tabular text-lg font-semibold text-white/80">{trait.host}</span></div><div role="meter" aria-label={`${participants.host} · ${trait.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={trait.host} className="h-2 min-w-0 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-white/50" style={{ width: `${trait.host}%` }} /></div></div>
                    <div className="min-w-0 rounded-xl bg-white/[0.035] p-3"><div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-2 gap-y-1"><span className="text-[11px] leading-5 text-white/70">{participants.guest}</span><span className="score-tabular text-lg font-semibold" style={{ color: theme.accent }}>{trait.guest}</span></div><div role="meter" aria-label={`${participants.guest} · ${trait.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={trait.guest} className="h-2 min-w-0 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full" style={{ width: `${trait.guest}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div></div>
                  </div>
                  <details className="mt-3 rounded-xl border border-white/10 px-4 py-2"><summary className="min-h-9 cursor-pointer py-2 text-xs font-semibold leading-5 text-white/75">{detailsCopy.explain} · {trait.label}</summary><p className="max-w-[65ch] pb-2 pt-3 text-sm leading-7 text-white/70">{narrative.traitNotes[trait.key]}</p></details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pair-listen" tabIndex={-1} className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12 sm:px-8 lg:py-24 focus:!outline-none">
        <div className="mb-9"><p className="eyebrow mb-3">{copy.togetherTag}</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.together}</h2></div>
        <p className="mb-6 text-xs leading-5 text-white/60">{detailsCopy.criteria}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {jointRecommendations.map((recommendation, index) => {
            const genre = genres.find(item => item.id === recommendation.genreId);
            if (!genre) return null;
            return <article key={genre.id} className="result-card min-w-0 p-6"><span className="score-tabular text-xs text-white/40">0{index + 1}</span><h3 className="mt-6 text-2xl font-bold tracking-[-.04em] [overflow-wrap:anywhere]">{getGenreName(genre, language)}</h3><p className="mt-3 text-sm leading-6 text-white/70">{getGenreDescription(genre.id, genre.description, language)}</p><div className="score-tabular mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/65"><p>{participants.host}<strong className="mt-1 block text-base text-white/80">{recommendation.hostCompatibility}%</strong></p><p>{participants.guest}<strong className="mt-1 block text-base" style={{ color: theme.accent }}>{recommendation.guestCompatibility}%</strong></p></div></article>;
          })}
        </div>
        {pairTracks.length > 0 && <div className="mt-12 border-t border-white/10 pt-10">
          <h3 className="text-2xl font-bold tracking-[-.03em] sm:text-3xl">{trackCopy.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{trackCopy.note}</p>
          <p id="pair-track-change-note" className="mt-2 max-w-2xl text-xs leading-5 text-white/60">{rotationCopy.note}</p>
          <p data-testid="pair-track-status" role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-xs leading-6 text-white/75">{changedArtist ? `${changedTrackLabel} ${getArtistName(changedArtist, language)} · ${changedArtist.track.title}` : ''}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {pairTracks.map(({ artist, genreId, role, hostCompatibility, guestCompatibility }, index) => {
              const genre = genres.find(item => item.id === genreId);
              const canRotate = pairTrackAlternatives(pairTracks, index, hostScores, guestScores, genres, musicCatalog, hostVersion, guestVersion).length > 1;
              return <article key={role} data-testid={`pair-track-${role}`} className="result-card flex min-w-0 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4"><p className="max-w-[22ch] text-[10px] font-bold leading-5 tracking-[.06em]" style={{ color: theme.accent }}>{role === 'shared' && Math.min(hostCompatibility, guestCompatibility) < SHARED_GENRE_MINIMUM ? detailsCopy.discovery : trackCopy[role]}</p><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55"><Music2 size={14} /></span></div>
                <h4 id={`pair-track-title-${role}`} className="mt-5 text-xl font-bold leading-snug tracking-[-.025em] [overflow-wrap:anywhere]">{artist.track.title}</h4>
                <p className="mt-3 text-sm font-semibold text-white/85">{getArtistName(artist, language)}</p>
                <p className="mt-1 text-xs leading-5 text-white/60">{getArtistSubtitle(artist, language)}</p>
                {artist.album.credit && <p data-testid="pair-recording-credit" className="mt-2 text-[11px] leading-5 text-white/60 [overflow-wrap:anywhere]">{recordingCreditLabel}: {artist.album.credit}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-white/65">{genre && <><span>{getGenreName(genre, language)}</span><span aria-hidden="true">·</span></>}<span className="score-tabular">{artist.track.year}</span></div>
                <div className="score-tabular mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white/[0.025] p-3 text-[10px] leading-5 text-white/65"><p>{participants.host}<strong className="block text-sm text-white/80">{hostCompatibility}%</strong></p><p>{participants.guest}<strong className="block text-sm" style={{ color: theme.accent }}>{guestCompatibility}%</strong></p></div>
                <p data-testid="pair-track-reason" className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-white/70"><span className="mb-2 block text-[10px] font-semibold text-white/60">{detailsCopy.reason}</span>{pairTrackReason(role, hostCompatibility, guestCompatibility, language)}</p>
                <div className="mt-auto pt-6">
                  <a href={artist.track.spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={() => analytics.track('music_link_click', { provider: 'spotify', contentType: 'track', artist: artist.name, genre: genre?.name, context: 'compatibility-result' })} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1ed760] px-4 py-3 text-xs font-bold leading-5 text-black transition-colors hover:bg-[#42e67b]" aria-label={`${getArtistName(artist, language)} · ${artist.track.title}: ${trackCopy.listen}`}>{trackCopy.listen}<ExternalLink size={13} className="shrink-0" /></a>
                  <button type="button" disabled={!canRotate} aria-describedby={`pair-track-title-${role} pair-track-change-note`} onClick={() => rotateTrack(index)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold leading-5 text-white/75 transition-colors hover:bg-white/10 disabled:opacity-40"><RefreshCw aria-hidden="true" size={13} className="shrink-0" />{canRotate ? rotationCopy.button : rotationCopy.empty}</button>
                </div>
              </article>;
            })}
          </div>
        </div>}
      </section>

      <section id="pair-share" tabIndex={-1} className="scroll-mt-6 border-t border-white/10 bg-black/20 focus:!outline-none">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-24">
          <div className="mb-8 text-center"><p className="eyebrow mb-3">{copy.shareTag}</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{copy.shareTitle}</h2><p className="mt-4 text-sm text-white/70">{copy.shareBody}</p></div>
          <div data-testid="pair-share-card" ref={cardRef} className="relative mx-auto min-h-[720px] w-full max-w-[600px] overflow-hidden rounded-[32px] border border-white/20 bg-[#050507] p-7 shadow-2xl sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <div className="absolute -right-[20%] -top-[8%] h-[60%] w-[75%] rounded-full opacity-40 blur-[85px]" style={{ background: theme.accent }} />
              <div className="absolute -bottom-[15%] -left-[18%] h-[50%] w-[70%] rounded-full opacity-25 blur-[90px]" style={{ background: theme.secondary }} />
              <div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
            </div>
            <div className="relative z-10 flex min-h-[662px] flex-col sm:min-h-[638px]">
              <header className="flex items-start justify-between border-b border-white/15 pb-5"><div><p className="text-sm font-extrabold tracking-[-.03em]">MUTI</p><p className="mt-1 text-[10px] font-semibold tracking-[.18em] text-white/65">{copy.cardTag}</p></div><Users size={18} className="text-white/65" /></header>
              <div className="flex flex-1 flex-col justify-center py-6 text-center">
                <p className="text-[10px] font-bold tracking-[.18em]" style={{ color: theme.accent }}>{copy.cardScore}</p>
                <p className="score-tabular mt-4 text-[clamp(5rem,20vw,9rem)] font-extrabold leading-none tracking-[-.08em]" style={{ color: theme.accent }}>{compatibility.score}<span className="text-[.25em]">%</span></p>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.04em] sm:text-4xl">{compatibility.title}</h3>
                <p className="mt-4 break-words text-sm font-semibold leading-6 text-white/75">{narrative.shareLine}</p>
                <div className="mt-8 grid grid-cols-1 items-center gap-5 border-y border-white/12 py-5 text-left min-[360px]:grid-cols-[1fr_auto_1fr] min-[360px]:gap-3">
                  <div className="min-w-0"><p className="text-[9px] uppercase tracking-[.08em] text-white/65">{participants.host}</p><p className="mt-2 break-words text-lg font-bold">{hostGenre ? getGenreName(hostGenre, language) : 'MUSIC TYPE'}</p><p className="mt-2 break-words text-xs leading-5 text-white/75">{hostType}</p></div>
                  <Sparkles size={15} className="hidden min-[360px]:block" style={{ color: theme.accent }} />
                  <div className="min-w-0 min-[360px]:text-right"><p className="text-[9px] uppercase tracking-[.08em] text-white/65">{participants.guest}</p><p className="mt-2 break-words text-lg font-bold">{guestGenre ? getGenreName(guestGenre, language) : 'MUSIC TYPE'}</p><p className="mt-2 break-words text-xs leading-5 text-white/75">{guestType}</p></div>
                </div>
              </div>
              <footer className="flex flex-col gap-3 border-t border-white/15 pt-5 min-[360px]:flex-row min-[360px]:items-end min-[360px]:justify-between"><p className="min-w-0 text-[10px] leading-4 text-white/70">MUSIC 5<br />{copy.disclaimer}</p><p className="shrink-0 whitespace-nowrap text-[9px] font-bold tracking-[.1em] text-white/65">BY CHAMELEONS</p></footer>
            </div>
          </div>

          <ShareActions scope="pair" accent={theme.accent} sharing={sharing} />

          <details className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 text-sm font-semibold text-white/75"><RefreshCw size={17} />{copy.another}</summary>
            <p className="mt-3 text-center text-xs leading-5 text-white/60">{language === 'ko' ? '초대에 사용할 결과를 선택해 주세요.' : language === 'ja' ? '招待に使う結果を選んでください。' : 'Choose which result to put in the new invite.'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{(['host', 'guest'] as const).map(person => <button key={person} onClick={() => onCreateInvite(person)} className="secondary-action !px-3 !text-xs">{language === 'ko' ? `${participants[person]}의 결과로 초대` : language === 'ja' ? `${participants[person]}の結果で招待` : `Invite with the ${participants[person].toLowerCase()} result`}</button>)}</div>
          </details>
          <p className="mx-auto mt-6 max-w-[65ch] text-center text-[11px] leading-6 text-white/65">{copy.private}</p>
          <ResultFeedback key={selectionKey} context={{ kind: 'pair', genres: [hostGenre, guestGenre].flatMap(genre => genre ? [getGenreName(genre, language)] : []), versions: [hostVersion, guestVersion], tracks: pairTracks.map(pick => `${getArtistName(pick.artist, language)} · ${pick.artist.track.title}`) }} />
        </div>
      </section>
    </main>
  );
};

export default CompatibilityResults;
