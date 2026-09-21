const CAPTURE_OPTIONS = {
  backgroundColor: '#050507',
  cacheBust: true,
  pixelRatio: 2,
};

export async function captureCardBlob(element: HTMLElement) {
  if (typeof document !== 'undefined' && document.fonts) await document.fonts.ready;
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(element, CAPTURE_OPTIONS);
  if (!blob) throw new Error('Image creation failed');
  return blob;
}

export function isAppleMobileBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export async function saveCardImage(element: HTMLElement, filename: string, title: string, preparedBlob?: Blob) {
  const blob = preparedBlob ?? await captureCardBlob(element);
  const file = new File([blob], filename, { type: 'image/png' });

  if (isAppleMobileBrowser() && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, files: [file] });
    return 'share-sheet' as const;
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = objectUrl;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  return 'download' as const;
}
