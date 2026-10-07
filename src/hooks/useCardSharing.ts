'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Language } from '@/types/i18n';
import { captureCardBlob, createStoryImageBlob, downloadImageBlob, isAppleMobileBrowser, isMobileBrowser, saveCardImage } from '@/lib/cardExport';

type ImageState = 'idle' | 'preparing' | 'ready' | 'error';
type SharingAction = 'link' | 'copy' | 'image' | 'story';
interface ImageFallback { blob: Blob; filename: string; story: boolean }
interface CardSharingOptions {
  cardRef: RefObject<HTMLDivElement | null>;
  language: Language;
  url: string;
  title: string;
  text: string;
  accent: string;
  secondary: string;
  filename: string;
  storyFilename: string;
  onAction: (action: string) => void;
}

export function useCardSharing(options: CardSharingOptions) {
  const { cardRef, language, url, accent, secondary } = options;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [apple, setApple] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [imageState, setImageState] = useState<ImageState>('idle');
  const [storyState, setStoryState] = useState<ImageState>('idle');
  const [imageFallback, setImageFallback] = useState<ImageFallback | null>(null);
  const [manualCopy, setManualCopy] = useState(false);
  const pendingRef = useRef<SharingAction | null>(null);
  const [pendingAction, setPendingAction] = useState<SharingAction | null>(null);
  const copy = language === 'ko'
    ? { copied: '링크를 복사했어요.', failed: '공유하지 못했어요. 링크 복사나 이미지 저장을 이용해 주세요.', copyFailed: '자동 복사가 차단됐어요. 아래 링크를 선택해 직접 복사해 주세요.', fileShareFailed: '이미지는 준비됐지만 기기의 파일 공유에 실패했어요. 아래 직접 저장 버튼을 눌러주세요.', saved: '이미지를 준비했어요.', downloaded: '이미지 파일을 저장했어요. 다운로드 목록을 확인해 주세요.', downloadFailed: '파일을 저장하지 못했어요. 직접 저장을 다시 누르거나 링크로 공유해 주세요.', storySaved: '스토리용 이미지를 저장했어요. 원하는 앱에서 직접 올려주세요.', imageFailed: '이미지를 만들지 못했어요. 다시 준비해 주세요.', ready: '이미지가 준비됐어요. 한 번 더 눌러 공유해 주세요.' }
    : language === 'ja'
      ? { copied: 'リンクをコピーしました。', failed: 'シェアできませんでした。リンクのコピーや画像保存をお試しください。', copyFailed: '自動コピーが制限されています。下のリンクを選択してコピーしてください。', fileShareFailed: '画像は準備できましたが、端末でのファイル共有に失敗しました。下の保存ボタンを押してください。', saved: '画像を用意しました。', downloaded: '画像ファイルを保存しました。ダウンロード一覧をご確認ください。', downloadFailed: 'ファイルを保存できませんでした。保存を再試行するか、リンクでシェアしてください。', storySaved: 'ストーリー画像を保存しました。投稿するアプリからアップロードしてください。', imageFailed: '画像を作成できませんでした。もう一度準備してください。', ready: '画像を準備しました。もう一度押してシェアしてください。' }
      : { copied: 'Link copied.', failed: 'Could not share. Try copying the link or saving the image.', copyFailed: 'Automatic copying is blocked. Select the link below and copy it manually.', fileShareFailed: 'The image is ready, but file sharing failed. Use the direct save button below.', saved: 'Image is ready.', downloaded: 'Image file saved. Check your downloads.', downloadFailed: 'Could not save the file. Try direct save again or share a link.', storySaved: 'Story image saved. Upload it in your preferred app.', imageFailed: 'Could not create the image. Please retry.', ready: 'Image ready. Tap again to share.' };

  useEffect(() => {
    const isMobile = isMobileBrowser();
    setApple(isAppleMobileBrowser());
    setMobile(isMobile);
    setCardBlob(null);
    setStoryBlob(null);
    setFeedback(null);
    setImageFallback(null);
    setManualCopy(false);
    setImageState(isMobile ? 'preparing' : 'idle');
    setStoryState(isMobile ? 'preparing' : 'idle');
    if (!isMobile || !cardRef.current) return;
    let active = true;
    void captureCardBlob(cardRef.current).then(async blob => {
      if (!active) return;
      setCardBlob(blob);
      setImageState('ready');
      try {
        const story = await createStoryImageBlob(blob, accent, secondary);
        if (active) { setStoryBlob(story); setStoryState('ready'); }
      } catch { if (active) setStoryState('error'); }
    }).catch(() => { if (active) { setImageState('error'); setStoryState('error'); } });
    return () => { active = false; };
  }, [cardRef, url, language, accent, secondary]);

  const cancelled = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';
  const runAction = async (action: SharingAction, task: () => Promise<void>) => {
    // A ref also catches two taps before React renders the disabled buttons.
    // Call the task synchronously to preserve native sharing's user gesture.
    if (pendingRef.current) return;
    pendingRef.current = action;
    setPendingAction(action);
    setFeedback(null);
    try { await task(); }
    finally { pendingRef.current = null; setPendingAction(null); }
  };
  const performCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      options.onAction('copy');
      setManualCopy(false);
      setFeedback(copy.copied);
    } catch {
      // Show the score-bearing URL only after an explicit copy action fails.
      setManualCopy(true);
      setFeedback(copy.copyFailed);
    }
  };
  const copyLink = () => runAction('copy', performCopy);
  const shareLink = () => runAction('link', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: options.title, text: options.text, url });
        options.onAction('native-link');
      } else {
        await performCopy();
      }
    } catch (error) { if (!cancelled(error)) setFeedback(copy.failed); }
  });
  const saveImage = () => runAction('image', async () => {
    if (!cardRef.current) return;
    setImageFallback(null);
    try {
      if (apple && !cardBlob) {
        setImageState('preparing');
        setCardBlob(await captureCardBlob(cardRef.current));
        setImageState('ready');
        setFeedback(copy.ready);
        return;
      }
      if (!cardBlob) setImageState('preparing');
      const blob = cardBlob ?? await captureCardBlob(cardRef.current);
      setCardBlob(blob);
      setImageState('ready');
      const file = new File([blob], options.filename, { type: 'image/png' });
      const usesShareSheet = apple && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] });
      let delivery: 'share-sheet' | 'download';
      try {
        delivery = await saveCardImage(cardRef.current, options.filename, options.title, blob);
      } catch (error) {
        if (cancelled(error)) return;
        if (usesShareSheet) {
          // A valid PNG should not be recaptured when only the share transport failed.
          setImageFallback({ blob, filename: options.filename, story: false });
          setFeedback(copy.fileShareFailed);
          return;
        }
        setImageFallback({ blob, filename: options.filename, story: false });
        setFeedback(copy.downloadFailed);
        return;
      }
      options.onAction('download');
      setFeedback(delivery === 'download' ? copy.downloaded : copy.saved);
    } catch (error) { if (!cancelled(error)) { setImageState('error'); setFeedback(copy.imageFailed); } }
  });
  const shareStory = () => runAction('story', async () => {
    if (!cardRef.current) return;
    setImageFallback(null);
    try {
      // Prebuilt mobile images preserve the user gesture required for file sharing.
      if (mobile && !storyBlob) {
        setStoryState('preparing');
        const blob = cardBlob ?? await captureCardBlob(cardRef.current);
        setCardBlob(blob);
        setImageState('ready');
        setStoryBlob(await createStoryImageBlob(blob, accent, secondary));
        setStoryState('ready');
        setFeedback(copy.ready);
        return;
      }
      if (!storyBlob) setStoryState('preparing');
      const image = storyBlob ?? await createStoryImageBlob(cardBlob ?? await captureCardBlob(cardRef.current), accent, secondary);
      setStoryState('ready');
      const file = new File([image], options.storyFilename, { type: 'image/png' });
      if (storyBlob && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: options.title, files: [file] });
          options.onAction('story-native-file');
        } catch (error) {
          if (cancelled(error)) return;
          setImageFallback({ blob: image, filename: file.name, story: true });
          setFeedback(copy.fileShareFailed);
        }
      } else {
        try {
          downloadImageBlob(image, file.name);
          options.onAction('story-download');
          setFeedback(copy.storySaved);
        } catch {
          setImageFallback({ blob: image, filename: file.name, story: true });
          setFeedback(copy.downloadFailed);
        }
      }
    } catch (error) { if (!cancelled(error)) { setStoryState('error'); setFeedback(copy.imageFailed); } }
  });
  const saveFallbackImage = () => {
    if (!imageFallback || pendingRef.current) return;
    try {
      // Kept synchronous so the second tap is the actual download gesture.
      downloadImageBlob(imageFallback.blob, imageFallback.filename);
      options.onAction(imageFallback.story ? 'story-download' : 'download');
      setFeedback(imageFallback.story ? copy.storySaved : copy.downloaded);
      setImageFallback(null);
    } catch { setFeedback(copy.downloadFailed); }
  };

  return { feedback, pendingAction, shareLink, shareStory, saveImage, copyLink, saveFallbackImage,
    fallbackImage: imageFallback ? { filename: imageFallback.filename, story: imageFallback.story } : null,
    manualCopyUrl: manualCopy ? url : null,
    imagePreparing: imageState === 'preparing', imageError: imageState === 'error',
    storyPreparing: storyState === 'preparing', storyError: storyState === 'error' };
}
