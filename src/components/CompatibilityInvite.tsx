'use client';

import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Link2, LockKeyhole, Share2, Sparkles } from 'lucide-react';
import { GenreSchema, MUSICPersonality } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { recommendGenres } from '@/lib/musicCalculations';
import { getGenreName } from '@/lib/genreTranslations';
import { getGenreTheme } from '@/lib/resultTheme';
import { getComparisonUrl, MUSIC_TRAITS } from '@/lib/compatibility';
import { getRecentResultVersion, RecentMusicResult } from '@/lib/recentResults';
import { analytics } from '@/lib/analytics';
import LanguageSelector from '@/components/LanguageSelector';
import ManualCopyField from '@/components/ui/ManualCopyField';
import type { ResultVersion } from '@/lib/resultVersion';

interface CompatibilityInviteProps {
  mode: 'create' | 'respond';
  hostScores: MUSICPersonality;
  hostVersion: ResultVersion;
  genres: GenreSchema[];
  recentResults: RecentMusicResult[];
  onStartSurvey: () => void;
  onUseRecent: (result: RecentMusicResult) => void;
  onBack: () => void;
}

const TRAIT_LABELS = {
  ko: ['차분함', '편안함', '탐구성', '강렬함', '현대적 사운드'],
  en: ['Mellow', 'Easygoing', 'Sophisticated', 'Intense', 'Contemporary'],
  ja: ['穏やかさ', '親しみやすさ', '探究心', '力強さ', '現代的な音'],
};

const CompatibilityInvite: React.FC<CompatibilityInviteProps> = ({ mode, hostScores, hostVersion, genres, recentResults, onStartSurvey, onUseRecent, onBack }) => {
  const { language } = useLanguage();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [manualCopyUrl, setManualCopyUrl] = useState<string | null>(null);
  useEffect(() => { setManualCopyUrl(null); setFeedback(null); }, [hostScores, hostVersion, language]);
  const hostRecommendation = useMemo(() => recommendGenres(hostScores, genres, language, hostVersion)[0], [genres, hostScores, hostVersion, language]);
  // Equal scores do not establish that two listeners are the same person.
  const eligibleRecentResult = recentResults[0];
  const recentGenre = eligibleRecentResult ? genres.find(genre => genre.id === recommendGenres(eligibleRecentResult.scores, genres, language, getRecentResultVersion(eligibleRecentResult))[0]?.genreId) : undefined;
  const flowCopy = language === 'ko'
    ? { title: '친구에게 보내고,\n취향을 비교해보세요.', body: '내 결과가 담긴 초대 링크예요. 친구가 자기 결과를 연결하면 두 사람의 궁합을 확인할 수 있어요.', back: '내 결과로 돌아가기', saved: '사용할 저장 결과', others: '다른 저장 결과 선택', retake: '새로 검사해서 비교하기' }
    : language === 'ja'
      ? { title: '友達に送って、\n好みを比べよう。', body: 'あなたの結果が入った招待リンクです。友達が自分の結果をつなげると、二人の相性を確認できます。', back: '自分の結果に戻る', saved: '使う保存済み結果', others: 'ほかの保存済み結果を選ぶ', retake: '新しくテストして比べる' }
      : { title: 'Send it to a friend.\nCompare your tastes.', body: 'This invite contains your result. Your friend can connect theirs to see your music match.', back: 'Back to my result', saved: 'Saved result to use', others: 'Choose another saved result', retake: 'Take a new test to compare' };
  const hostGenre = genres.find(genre => genre.id === hostRecommendation?.genreId);
  const theme = getGenreTheme(hostGenre);
  const pageStyle = { '--result-accent': theme.accent, '--result-secondary': theme.secondary } as CSSProperties;
  const copy = language === 'ko' ? {
    back: '돌아가기', eyebrow: 'MUSIC MATCH', title: '우리의 음악 취향,\n얼마나 닮았을까요?', body: '초대 링크를 친구에게 보내거나, 받은 링크에서 내 결과를 연결해보세요. 두 사람의 닮은 점, 다른 점, 함께 시도할 음악을 확인할 수 있어요.',
    host: '초대한 사람의 음악 성격', match: '장르 유사도', start: '내 음악 성격 검사하기', recent: '최근 결과로 바로 궁합 보기', share: '초대 링크 보내기', copy: '링크 복사',
    privacy: '로그인 없이 진행돼요. 공유 링크에 점수가 포함되며 링크를 받은 사람도 볼 수 있어요.', time: '약 5분', questions: '40문항', fun: '가볍게 즐기는 테스트',
  } : language === 'ja' ? {
    back: '戻る', eyebrow: 'MUSIC MATCH', title: '二人の音楽の好みは、\nどれくらい似ている？', body: '招待リンクを友達に送るか、届いたリンクに自分の結果をつなげましょう。二人の共通点や違い、一緒に試す音楽がわかります。',
    host: '招待した人の音楽性格', match: 'ジャンル一致度', start: '自分の音楽性格を調べる', recent: '最近の結果ですぐ比較', share: '招待リンクを送る', copy: 'リンクをコピー',
    privacy: 'ログインは不要です。共有リンクにはスコアが含まれ、受信者も確認できます。', time: '約5分', questions: '40問', fun: '気軽に楽しむテスト',
  } : {
    back: 'Back', eyebrow: 'MUSIC MATCH', title: 'How alike are\nyour music tastes?', body: 'Send an invite to a friend, or connect your result to a link you received. Discover where you align, where you differ, and music to try together.',
    host: "Inviter's music personality", match: 'genre similarity', start: 'Take my music test', recent: 'Use my recent result', share: 'Send invite link', copy: 'Copy link',
    privacy: 'No login. Share links include scores that recipients can see.', time: 'about 5 min', questions: '40 questions', fun: 'just for fun',
  };
  const recoveryCopy = language === 'ko'
    ? { label: '직접 복사할 초대 링크', select: '초대 링크 전체 선택', hint: '전체 선택 버튼을 누른 뒤 기기의 복사 메뉴를 이용해 주세요. 이 초대 링크에는 초대한 사람의 결과 점수가 담겨 있어요.', copyFailed: '자동 복사가 차단됐어요. 아래 초대 링크를 직접 복사해 주세요.', shareFailed: '공유하지 못했어요. 아래 초대 링크를 직접 복사해 전달해 주세요.' }
    : language === 'ja'
      ? { label: '手動コピー用の招待リンク', select: '招待リンクをすべて選択', hint: '全選択ボタンを押してから、端末のコピー機能を使ってください。招待リンクには招待した人のスコアが含まれます。', copyFailed: '自動コピーが制限されています。下の招待リンクをコピーしてください。', shareFailed: 'シェアできませんでした。下の招待リンクをコピーして送ってください。' }
      : { label: 'Invite link for manual copying', select: 'Select the whole invite link', hint: 'Use the select button, then your device’s Copy option. This invite link contains the inviter’s result scores.', copyFailed: 'Automatic copying is blocked. Copy the invite link below manually.', shareFailed: 'Could not share. Copy the invite link below and send it yourself.' };
  const invitationCopy = mode === 'create'
    ? {
      button: copy.share,
      title: language === 'ko' ? '우리 음악 궁합은 몇 퍼센트?' : language === 'ja' ? '私たちの音楽相性は何％？' : 'How compatible are our music tastes?',
      text: language === 'ko' ? '내 음악 취향과 얼마나 닮았는지 확인해봐!' : language === 'ja' ? 'テストで私との音楽の好みを比べてみて！' : 'Take the test and compare your music taste with mine.',
      hint: '',
    }
    : language === 'ko'
      ? { button: '받은 초대 전달', title: '초대한 사람과 음악 궁합은 몇 퍼센트?', text: '초대한 사람의 음악 취향과 얼마나 닮았는지 확인해봐!', hint: '전달받는 사람은 원래 초대한 사람과 비교하게 돼요. 내 결과로 초대하는 링크는 아니에요.' }
      : language === 'ja'
        ? { button: '届いた招待を転送', title: '招待した人との音楽相性は何％？', text: '招待した人との音楽の好みを比べてみて！', hint: '転送先では元の招待者との相性を比較します。あなたの結果で招待するリンクではありません。' }
        : { button: 'Forward this invite', title: 'How well do you match this inviter?', text: 'Compare your music taste with the original inviter.', hint: 'The recipient will compare with the original inviter. This is not an invite with your own result.' };

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const copyLink = async () => {
    const url = getComparisonUrl(hostScores, null, language, { hostVersion });
    setFeedback(null);
    try {
      await navigator.clipboard.writeText(url);
      setManualCopyUrl(null);
      analytics.track('compatibility_invite_shared', { shareType: 'copy' });
      notify(language === 'ko' ? '초대 링크를 복사했어요.' : language === 'ja' ? '招待リンクをコピーしました。' : 'Invite link copied.');
    } catch {
      setManualCopyUrl(url);
      notify(recoveryCopy.copyFailed);
    }
  };

  const shareInvite = async () => {
    const url = getComparisonUrl(hostScores, null, language, { hostVersion });
    setFeedback(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: invitationCopy.title,
          text: invitationCopy.text,
          url,
        });
        setManualCopyUrl(null);
        analytics.track('compatibility_invite_shared', { shareType: 'native' });
        return;
      }
      await copyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setManualCopyUrl(url);
      notify(recoveryCopy.shareFailed);
    }
  };

  return (
    <main className="result-surface min-h-[100dvh] text-white" style={pageStyle}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={onBack} className="ui-icon-button gap-2 px-4 text-xs font-semibold"><ArrowLeft size={15} />{copy.back}</button>
        <LanguageSelector />
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-84px)] max-w-6xl items-center gap-10 px-5 pb-14 pt-5 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="fade-in">
          <p className="eyebrow mb-5" style={{ color: theme.accent }}>{copy.eyebrow}</p>
          <h1 className="whitespace-pre-line text-[clamp(2.6rem,6vw,6rem)] font-extrabold leading-[1.04] tracking-[-.06em] text-balance">{mode === 'create' ? flowCopy.title : copy.title}</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg sm:leading-8">{mode === 'create' ? flowCopy.body : copy.body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {mode === 'create' ? <button onClick={() => void shareInvite()} className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Share2 size={17} />{invitationCopy.button}</button>
              : eligibleRecentResult ? <button data-testid="use-recent-primary" onClick={() => onUseRecent(eligibleRecentResult)} className="primary-action inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}><Clock3 size={17} />{copy.recent}</button>
                : <button onClick={() => { analytics.track('compatibility_test_started'); onStartSurvey(); }} className="primary-action group inline-flex items-center justify-center gap-2" style={{ background: theme.accent, borderColor: theme.accent }}>{copy.start}<ArrowRight size={18} /></button>}
            {mode === 'create' ? <button onClick={onBack} className="secondary-action">{flowCopy.back}</button>
              : eligibleRecentResult && <button onClick={() => { analytics.track('compatibility_test_started'); onStartSurvey(); }} className="secondary-action">{flowCopy.retake}</button>}
          </div>

          {mode === 'respond' && eligibleRecentResult && <div className="ui-panel mt-4 !rounded-2xl p-4">
            <p className="text-xs text-white/70">{flowCopy.saved}</p><p className="mt-1 break-words text-lg font-bold">{recentGenre ? getGenreName(recentGenre, language) : 'MUSIC TYPE'}</p>
            {recentResults.length > 1 && <details className="mt-3"><summary className="cursor-pointer py-2 text-xs font-semibold text-white/70">{flowCopy.others}</summary><div className="mt-2 space-y-2">{recentResults.slice(1).map(result => {
              const genreId = recommendGenres(result.scores, genres, language, getRecentResultVersion(result))[0]?.genreId;
              const genre = genres.find(item => item.id === genreId);
              return <button key={result.id} onClick={() => onUseRecent(result)} className="min-h-11 w-full rounded-xl border border-white/10 px-3 py-2 text-left text-sm hover:bg-white/10">{genre ? getGenreName(genre, language) : 'MUSIC TYPE'}</button>;
            })}</div></details>}
          </div>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {mode === 'respond' && <button onClick={() => void shareInvite()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-xs font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"><Share2 size={15} />{invitationCopy.button}</button>}
            <button onClick={() => void copyLink()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold text-white/70 transition-colors hover:text-white"><Link2 size={15} />{copy.copy}</button>
          </div>
          {mode === 'respond' && <p className="mt-2 max-w-xl text-xs leading-5 text-white/65">{invitationCopy.hint}</p>}
          <div className="mt-2 min-h-5 text-xs text-white/45" aria-live="polite">{feedback && <span className="inline-flex items-center gap-1.5"><Check size={13} />{feedback}</span>}</div>
          {manualCopyUrl && <ManualCopyField value={manualCopyUrl} label={recoveryCopy.label} selectLabel={recoveryCopy.select} hint={recoveryCopy.hint} testId="invite-manual-link" />}

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
            <span>{copy.questions}</span><span>{copy.time}</span><span>{copy.fun}</span>
          </div>
          <p className="mt-4 flex max-w-xl items-start gap-2 text-[11px] leading-5 text-white/65"><LockKeyhole size={13} className="mt-0.5 shrink-0" />{copy.privacy}</p>
        </div>

        <article className="result-card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-[70px]" style={{ background: theme.accent }} />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div><p className="eyebrow mb-2">INVITE / 01</p><h2 className="text-lg font-bold">{copy.host}</h2></div>
              <Sparkles size={20} style={{ color: theme.accent }} />
            </div>
            <div className="py-8">
              <h3 className="max-w-[12ch] text-[clamp(2.1rem,7vw,3.75rem)] font-extrabold leading-[1.04] tracking-[-.055em] [overflow-wrap:anywhere]">{hostGenre ? getGenreName(hostGenre, language) : 'MUSIC TYPE'}</h3>
              <p className="score-tabular mt-5 text-5xl font-extrabold tracking-[-.06em]" style={{ color: theme.accent }}>{Math.round(hostRecommendation?.compatibility || 0)}<span className="text-lg">%</span></p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white/70">{copy.match}</p>
            </div>
            <div className="space-y-3 border-t border-white/10 pt-6">
              {MUSIC_TRAITS.map((trait, index) => (
                <div key={trait}>
                  <div className="mb-1.5 flex justify-between text-[10px] font-semibold text-white/70"><span>{TRAIT_LABELS[language][index]}</span><span className="score-tabular">{hostScores[trait]}</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${hostScores[trait]}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default CompatibilityInvite;
