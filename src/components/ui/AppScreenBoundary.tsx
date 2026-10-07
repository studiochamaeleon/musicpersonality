'use client';

import { Component, useEffect, useRef, type ReactNode } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import type { Language } from '@/types/i18n';
import { screenFailureNeedsReload } from '@/lib/screenRecovery';

interface Props {
  children: ReactNode;
  language: Language;
  onRetry: () => void;
  onHome: () => void;
}

function ScreenRecovery({ language, onRetry, onHome }: Omit<Props, 'children'>) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const copy = language === 'ko'
    ? { title: '화면을 불러오지 못했어요.', body: '연결을 확인한 뒤 다시 시도해 주세요. 결과 링크는 유지되며, 이 탭에 저장된 검사 응답이 있으면 이어서 불러옵니다.', retry: '화면 다시 불러오기', home: '홈으로 돌아가기', reload: '이 페이지 새로고침' }
    : language === 'ja'
      ? { title: '画面を読み込めませんでした。', body: '接続を確認して、もう一度お試しください。結果リンクはそのまま残り、このタブに保存済みの回答があれば続きから読み込みます。', retry: '画面をもう一度読み込む', home: 'ホームに戻る', reload: 'このページを再読み込み' }
      : { title: 'This screen could not be loaded.', body: 'Check your connection and try again. Your result link stays unchanged, and any answers saved in this tab will be restored.', retry: 'Load this screen again', home: 'Back to home', reload: 'Refresh this page' };
  return <main data-testid="screen-recovery" className="app-canvas flex min-h-[100dvh] items-center justify-center px-5 py-12 text-white sm:px-8">
    <section className="ui-panel w-full max-w-lg p-6 sm:p-8" aria-labelledby="screen-recovery-title">
      <p className="eyebrow mb-5 text-white/60">MUTI</p>
      <h1 ref={heading} tabIndex={-1} id="screen-recovery-title" className="text-balance text-2xl font-extrabold leading-tight tracking-[-.04em] focus-visible:!outline-none sm:text-3xl">{copy.title}</h1>
      <p className="mt-4 text-sm leading-7 text-white/70">{copy.body}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button type="button" onClick={onRetry} className="primary-action inline-flex items-center justify-center gap-2"><RefreshCw size={16} aria-hidden="true" />{copy.retry}</button>
        <button type="button" onClick={onHome} className="secondary-action inline-flex items-center justify-center gap-2"><Home size={16} aria-hidden="true" />{copy.home}</button>
      </div>
      <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-11 w-full text-xs font-semibold text-white/65 underline underline-offset-4 hover:text-white">{copy.reload}</button>
    </section>
  </main>;
}

/** Only explicit user actions reset the boundary or reload the page. */
export default class AppScreenBoundary extends Component<Props, { failed: boolean; requiresReload: boolean }> {
  state = { failed: false, requiresReload: false };

  static getDerivedStateFromError(error: unknown) {
    return { failed: true, requiresReload: screenFailureNeedsReload(error) };
  }

  render() {
    return this.state.failed ? <ScreenRecovery language={this.props.language} onRetry={() => {
      // This is a user click, never an automatic reload. Turbopack and browsers
      // can cache rejected chunk loads beyond React.lazy's own wrapper cache.
      if (this.state.requiresReload) window.location.reload();
      else this.props.onRetry();
    }} onHome={this.props.onHome} /> : this.props.children;
  }
}
