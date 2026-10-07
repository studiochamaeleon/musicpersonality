'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronRight, Download, Instagram, Link2, LoaderCircle, Share2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useCardSharing } from '@/hooks/useCardSharing';

export function openResultShareMenu(scope: 'personal' | 'pair', source?: HTMLElement) {
  window.dispatchEvent(new CustomEvent('muti-open-share', { detail: { scope, source } }));
}

interface ShareActionsProps {
  scope: 'personal' | 'pair';
  accent: string;
  sharing: ReturnType<typeof useCardSharing>;
}

export default function ShareActions({ scope, accent, sharing }: ShareActionsProps) {
  const { language } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const manualLinkRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const pendingCopy = language === 'ko'
    ? { link: '링크를 보내는 중', copy: '링크 복사 중', image: '이미지 저장 중', story: '스토리 카드 공유 중' }
    : language === 'ja'
      ? { link: 'リンクを送信中', copy: 'リンクをコピー中', image: '画像を保存中', story: 'ストーリー画像を共有中' }
      : { link: 'Sending your link', copy: 'Copying link', image: 'Saving image', story: 'Sharing story card' };
  const recoveryCopy = language === 'ko'
    ? { image: '완성된 이미지 직접 저장', story: '완성된 스토리 이미지 직접 저장', imageHint: '파일 공유 대신 브라우저로 저장 · 취소한 공유는 자동 저장하지 않아요.', link: '직접 복사할 결과 링크', select: '링크 전체 선택', linkHint: '전체 선택 버튼을 누른 뒤 기기의 복사 메뉴를 이용해 주세요. 이 링크에는 결과 점수가 담겨 있어요.' }
    : language === 'ja'
      ? { image: '準備済みの画像を直接保存', story: '準備済みのストーリー画像を直接保存', imageHint: '共有の代わりにブラウザで保存します。共有をキャンセルした場合は自動保存しません。', link: '手動コピー用の結果リンク', select: 'リンクをすべて選択', linkHint: '全選択ボタンを押してから、端末のコピー機能を使ってください。リンクには結果スコアが含まれます。' }
      : { image: 'Save the prepared image directly', story: 'Save the prepared story image directly', imageHint: 'Save through your browser instead of file sharing. Cancelled shares are never downloaded automatically.', link: 'Result link for manual copying', select: 'Select the whole link', linkHint: 'Use the select button, then your device’s Copy option. This link contains your result scores.' };
  const copy = language === 'ko'
    ? { trigger: '결과 공유', title: '어떻게 공유할까요?', body: '결과 보내기와 친구 궁합 초대는 별개의 기능이에요.', link: '링크로 보내기', linkHint: '메시지나 카톡 등 원하는 앱으로 결과 전달', story: '스토리용 카드 공유', storyHint: '9:16 이미지 · 저장하거나 앱의 공유 메뉴로 전달', save: '이미지 저장', saveHint: '결과 카드를 이미지로 보관하거나 직접 전달', copy: '링크 복사', copyHint: '원하는 대화창에 붙여넣기', close: '공유 메뉴 닫기', preparing: '이미지 준비 중', retry: '이미지 다시 준비', storyPreparing: '스토리 카드 준비 중', storyRetry: '스토리 카드 다시 준비', note: '스토리 이미지는 앱에서 직접 올릴 수도 있어요. 공유 앱에 따라 제공되는 메뉴가 달라요. 링크 스티커가 필요하면 링크를 복사해 주세요.' }
    : language === 'ja'
      ? { trigger: '結果をシェア', title: 'シェアする方法を選ぶ', body: '結果のシェアと友達の相性への招待は別の機能です。', link: 'リンクを送る', linkHint: 'メッセージなど好きなアプリで結果を送る', story: 'ストーリー用カードをシェア', storyHint: '9:16の画像を保存するか、アプリに共有', save: '画像を保存', saveHint: '結果カードを保存して、好きな方法で送る', copy: 'リンクをコピー', copyHint: '好きな会話に貼り付ける', close: '共有メニューを閉じる', preparing: '画像を準備中', retry: '画像をもう一度準備', storyPreparing: 'ストーリー画像を準備中', storyRetry: 'ストーリー画像を再作成', note: 'ストーリー画像はアプリから直接投稿できます。使える共有先はアプリにより異なります。リンクスタンプにはコピーしたリンクを使ってください。' }
      : { trigger: 'Share result', title: 'How would you like to share?', body: 'Sharing a result is separate from inviting a friend to compare.', link: 'Send a link', linkHint: 'Send the result through your preferred messaging app', story: 'Share story card', storyHint: 'A 9:16 image to save or share with an app', save: 'Save image', saveHint: 'Keep the result card or send the image yourself', copy: 'Copy link', copyHint: 'Paste into any conversation', close: 'Close share menu', preparing: 'Preparing image', retry: 'Retry image', storyPreparing: 'Preparing story card', storyRetry: 'Retry story card', note: 'You can also upload the story image from your app. Available share destinations vary. Copy the link if you want to add a link sticker.' };
  const show = useCallback((source?: HTMLElement) => {
    if (dialogRef.current?.open) return;
    // Safari does not necessarily focus a button when tapped. Remember the actual opener.
    opener.current = source ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    dialogRef.current?.showModal();
    setOpen(true);
  }, []);
  useEffect(() => {
    const listener = (event: Event) => { const detail = (event as CustomEvent<{ scope: string; source?: HTMLElement }>).detail; if (detail.scope === scope) show(detail.source); };
    window.addEventListener('muti-open-share', listener);
    return () => window.removeEventListener('muti-open-share', listener);
  }, [scope, show]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const actions = [
    { id: 'link', label: copy.link, hint: copy.linkHint, icon: Share2, run: sharing.shareLink, disabled: false },
    { id: 'story', label: sharing.storyPreparing ? copy.storyPreparing : sharing.storyError ? copy.storyRetry : copy.story, hint: copy.storyHint, icon: Instagram, run: sharing.shareStory, disabled: sharing.storyPreparing },
    { id: 'image', label: sharing.imagePreparing ? copy.preparing : sharing.imageError ? copy.retry : copy.save, hint: copy.saveHint, icon: Download, run: sharing.saveImage, disabled: sharing.imagePreparing },
    { id: 'copy', label: copy.copy, hint: copy.copyHint, icon: Link2, run: sharing.copyLink, disabled: false },
  ];
  const selectManualLink = () => {
    const input = manualLinkRef.current;
    if (!input) return;
    // An input tap can place Safari's caret after its click handler. Selecting
    // from a separate explicit button keeps the full range under user control.
    input.focus({ preventScroll: true });
    input.select();
    input.setSelectionRange(0, input.value.length);
  };
  return <div className="mt-6">
    <button data-testid={`${scope}-share-trigger`} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${headingId}-dialog`} onClick={event => show(event.currentTarget)} className="primary-action mx-auto flex items-center justify-center gap-2" style={{ background: accent, borderColor: accent }}><Share2 size={17} />{copy.trigger}</button>
    <dialog id={`${headingId}-dialog`} ref={dialogRef} aria-labelledby={headingId} aria-busy={sharing.pendingAction ? true : undefined} data-testid={`${scope}-share-menu`} onClose={() => { setOpen(false); opener.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.currentTarget.close(); } }} className="ui-dialog fixed inset-x-0 bottom-3 top-auto mx-auto my-0 max-h-[calc(100dvh-1.5rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-[28px] border border-white/20 bg-[#101115] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm sm:inset-0 sm:m-auto sm:max-h-[calc(100dvh-2rem)] sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><p className="mb-2 text-[10px] font-bold tracking-[.16em]" style={{ color: accent }}>MUTI · SHARE</p><h2 id={headingId} className="text-2xl font-extrabold leading-tight tracking-[-.04em]">{copy.title}</h2></div><button autoFocus onClick={() => dialogRef.current?.close()} aria-label={copy.close} className="ui-icon-button"><X size={18} /></button></div>
      <p className="mt-2 text-xs leading-5 text-white/65">{copy.body}</p>
      <div className="mt-5 space-y-2">{actions.map(action => {
        const pending = sharing.pendingAction === action.id;
        const label = !pending ? action.label : action.id === 'image' && sharing.imagePreparing ? copy.preparing : action.id === 'story' && sharing.storyPreparing ? copy.storyPreparing : pendingCopy[sharing.pendingAction!];
        return <button key={action.id} aria-label={label} aria-busy={pending ? true : undefined} disabled={action.disabled || Boolean(sharing.pendingAction)} onClick={() => void action.run()} className={`ui-interactive-card flex min-h-16 w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/[.04] p-3.5 text-left hover:bg-white/10 ${pending ? 'disabled:opacity-100' : 'disabled:opacity-40'}`} style={action.id === 'link' ? { borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, background: `color-mix(in srgb, ${accent} 8%, #101115)` } : undefined}><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20" style={{ color: accent }}>{pending ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" /> : <action.icon size={18} />}</span><span className="min-w-0 flex-1"><span className="block break-words text-sm font-bold">{label}</span><span className="mt-1 block text-xs leading-5 text-white/65">{action.hint}</span></span><ChevronRight aria-hidden="true" size={15} className="shrink-0 text-white/35" /></button>;
      })}</div>
      {sharing.fallbackImage && <div className="mt-4 rounded-2xl border border-white/15 bg-white/[.04] p-4"><button data-testid="share-image-fallback" disabled={Boolean(sharing.pendingAction)} onClick={sharing.saveFallbackImage} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold leading-5 hover:bg-white/10 disabled:opacity-40"><Download size={16} className="shrink-0" />{sharing.fallbackImage.story ? recoveryCopy.story : recoveryCopy.image}</button><p className="mt-3 text-xs leading-5 text-white/65">{recoveryCopy.imageHint}</p></div>}
      {sharing.manualCopyUrl && <div className="mt-4 rounded-2xl border border-white/15 bg-white/[.04] p-4"><label htmlFor={`${headingId}-manual-link`} className="block text-xs font-semibold text-white/85">{recoveryCopy.link}</label><input id={`${headingId}-manual-link`} ref={manualLinkRef} data-testid="share-manual-link" readOnly value={sharing.manualCopyUrl} className="mt-3 min-h-11 w-full min-w-0 rounded-xl border border-white/15 bg-black/20 px-3 text-base text-white sm:text-xs" /><button type="button" aria-controls={`${headingId}-manual-link`} onClick={selectManualLink} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold leading-5 hover:bg-white/10"><Link2 size={16} className="shrink-0" />{recoveryCopy.select}</button><p className="mt-3 text-xs leading-5 text-white/65">{recoveryCopy.linkHint}</p></div>}
      <p className="mt-4 text-xs leading-5 text-white/55">{copy.note}</p>
      <div role="status" aria-live="polite" className="mt-3 min-h-6 text-sm leading-6" style={{ color: accent }}>{sharing.feedback}</div>
    </dialog>
  </div>;
}
