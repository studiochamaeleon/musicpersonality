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

export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false;
  return isAppleMobileBrowser() || /Android/i.test(navigator.userAgent);
}

export async function createStoryImageBlob(cardBlob: Blob, accent: string, secondary: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Story canvas is unavailable');

  context.fillStyle = '#050507';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(820, 390, 50, 650, 780, 1200);
  glow.addColorStop(0, `${accent}44`);
  glow.addColorStop(0.55, `${secondary}22`);
  glow.addColorStop(1, '#050507');
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'rgba(255,255,255,0.13)';
  for (let y = 35; y < canvas.height; y += 44) {
    for (let x = 35; x < canvas.width; x += 44) {
      context.beginPath();
      context.arc(x, y, 1.3, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.fillStyle = '#f4f4f6';
  context.font = '800 60px Pretendard, sans-serif';
  context.fillText('MUTI', 100, 195);
  context.fillStyle = 'rgba(255,255,255,0.6)';
  context.font = '600 22px Pretendard, sans-serif';
  context.textAlign = 'right';
  context.fillText('MUSIC TASTE IDENTITY', 980, 188);
  context.fillStyle = 'rgba(255,255,255,0.18)';
  context.fillRect(100, 238, 880, 2);

  const objectUrl = URL.createObjectURL(cardBlob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error('Story card image could not be loaded'));
      nextImage.src = objectUrl;
    });
    const scale = Math.min(880 / image.width, 1280 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.shadowColor = 'rgba(0,0,0,0.55)';
    context.shadowBlur = 80;
    context.drawImage(image, (1080 - width) / 2, 290 + (1280 - height) / 2, width, height);
    context.shadowBlur = 0;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  context.fillStyle = 'rgba(255,255,255,0.18)';
  context.fillRect(100, 1630, 880, 2);
  context.textAlign = 'center';
  context.fillStyle = '#f4f4f6';
  context.font = '700 32px Pretendard, sans-serif';
  context.fillText('muti.chameleonstudio.xyz', 540, 1705);
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.font = '500 22px Pretendard, sans-serif';
  context.fillText('MUSIC TASTE IDENTITY · BY CHAMELEONS', 540, 1755);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Story image creation failed')), 'image/png');
  });
}

export function downloadImageBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = objectUrl;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function saveCardImage(element: HTMLElement, filename: string, title: string, preparedBlob?: Blob) {
  const blob = preparedBlob ?? await captureCardBlob(element);
  const file = new File([blob], filename, { type: 'image/png' });

  if (isAppleMobileBrowser() && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, files: [file] });
    return 'share-sheet' as const;
  }

  downloadImageBlob(blob, filename);
  return 'download' as const;
}
