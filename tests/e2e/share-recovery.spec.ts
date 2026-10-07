import { expect, test, type Page } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const personal = '/?v=3&m=70&u=61&s=79&i=48&c=75';
const pair = '/#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75';

interface RecoveryState {
  nativeCalls: number;
  captures: number;
  downloads: { name: string; active: boolean | undefined; width: number; height: number; bytes: number }[];
}

interface PendingShareState {
  calls: number;
  finish?: () => void;
}

interface PendingCaptureState {
  captures: number;
  downloads: number;
  finish?: () => void;
}

declare global {
  interface Window { __shareRecovery?: RecoveryState; __pendingShare?: PendingShareState; __pendingCapture?: PendingCaptureState }
}

test('a pending native share blocks repeated taps and other sharing actions until it settles', async ({ page }) => {
  await page.addInitScript(() => {
    window.__pendingShare = { calls: 0 };
    Object.defineProperty(navigator, 'share', { configurable: true, value: () => {
      window.__pendingShare!.calls += 1;
      return new Promise<void>(resolve => { window.__pendingShare!.finish = resolve; });
    } });
  });
  await page.goto(personal);
  const menu = await openShareMenu(page);
  const link = menu.getByRole('button', { name: '링크로 보내기', exact: true });
  // Two taps in the same turn also exercise the synchronous guard, before React renders.
  await link.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  expect(await page.evaluate(() => window.__pendingShare?.calls)).toBe(1);
  await expect(menu.getByRole('button', { name: '링크를 보내는 중', exact: true })).toBeDisabled();
  await expect(menu.getByRole('button', { name: '링크 복사', exact: true })).toBeDisabled();
  await expect(menu).toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() => window.__pendingShare?.finish?.());
  await expect(link).toBeEnabled();
  await expect(menu).not.toHaveAttribute('aria-busy', 'true');
  await expect(menu.getByRole('status')).toHaveText('');
});

test('desktop image preparation is visible and repeated taps produce only one capture and download', async ({ page }) => {
  await page.addInitScript(() => {
    window.__pendingCapture = { captures: 0, downloads: 0 };
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)' });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...options) {
      window.__pendingCapture!.captures += 1;
      window.__pendingCapture!.finish = () => originalToBlob.call(this, callback, ...options);
    };
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (this.download) { window.__pendingCapture!.downloads += 1; return; }
      originalClick.call(this);
    };
  });
  await page.goto(personal);
  const menu = await openShareMenu(page);
  const image = menu.getByRole('button', { name: '이미지 저장', exact: true });
  await image.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect.poll(() => page.evaluate(() => window.__pendingCapture?.captures)).toBe(1);
  await expect(menu.getByRole('button', { name: '이미지 준비 중', exact: true })).toBeDisabled();
  await expect(menu.getByRole('button', { name: '링크 복사', exact: true })).toBeDisabled();
  await page.evaluate(() => window.__pendingCapture?.finish?.());
  await expect(image).toBeEnabled();
  expect(await page.evaluate(() => window.__pendingCapture?.downloads)).toBe(1);
  await expect(menu.getByRole('status')).toContainText('다운로드 목록을 확인해 주세요.');
});

test('closing a sticky-opened share menu restores its opener without moving the result page', async ({ page }) => {
  await page.goto(personal);
  await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 1100, behavior: 'instant' }));
  const sticky = page.getByTestId('mobile-result-actions');
  await expect(sticky).toBeVisible();
  const trigger = sticky.getByRole('button', { name: '결과 공유하기', exact: true });
  const scrollBefore = await page.evaluate(() => scrollY);
  await trigger.click();
  await expect(page.getByTestId('personal-share-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(before => Math.abs(scrollY - before), scrollBefore)).toBeLessThanOrEqual(1);
});

async function mockFileSharing(page: Page, { abort = false, captureFails = false } = {}) {
  await page.addInitScript(({ abort, captureFails }) => {
    const state: RecoveryState = { nativeCalls: 0, captures: 0, downloads: [] };
    window.__shareRecovery = state;
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {
      state.nativeCalls += 1;
      throw new DOMException(abort ? 'User cancelled' : 'File sharing is blocked', abort ? 'AbortError' : 'NotAllowedError');
    } });
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...options) {
      state.captures += 1;
      if (captureFails && state.captures === 1) { callback(null); return; }
      originalToBlob.call(this, callback, ...options);
    };
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (!this.download) { originalClick.call(this); return; }
      const name = this.download;
      const active = navigator.userActivation?.isActive;
      // Observe the real blob without relying on iPhone browser download events.
      void fetch(this.href).then(response => response.arrayBuffer()).then(buffer => {
        const bytes = new DataView(buffer);
        state.downloads.push({ name, active, width: bytes.getUint32(16), height: bytes.getUint32(20), bytes: buffer.byteLength });
      });
    };
  }, { abort, captureFails });
}

test('failed Apple file sharing preserves the card and offers direct saving on the next tap', async ({ page }) => {
  await mockFileSharing(page);
  for (const [path, filename] of [[personal, 'muti-result.png'], [pair, 'our-music-match.png']]) {
    await page.goto(path);
    const menu = await openShareMenu(page);
    await expect(menu.getByRole('button', { name: '스토리용 카드 공유', exact: true })).toBeEnabled({ timeout: 30_000 });
    const captures = await page.evaluate(() => window.__shareRecovery?.captures);
    await menu.getByRole('button', { name: '이미지 저장', exact: true }).click();
    await expect(menu.getByRole('status')).toContainText('이미지는 준비됐지만 기기의 파일 공유에 실패했어요.');
    await expect(menu.getByRole('button', { name: '이미지 다시 준비', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.__shareRecovery?.downloads)).toEqual([]);
    await menu.getByTestId('share-image-fallback').click();
    await expect.poll(() => page.evaluate(() => window.__shareRecovery?.downloads)).toMatchObject([{ name: filename, active: true }]);
    const state = await page.evaluate(() => window.__shareRecovery!);
    expect(state.nativeCalls).toBe(1);
    expect(state.captures).toBe(captures);
    expect(state.downloads[0].width).toBeGreaterThan(0);
    expect(state.downloads[0].height).toBeGreaterThan(0);
    expect(state.downloads[0].bytes).toBeGreaterThan(20_000);
    await expect(menu.getByTestId('share-image-fallback')).toHaveCount(0);
  }
});

test('failed story file sharing saves the same prepared 1080x1920 PNG without another capture', async ({ page }) => {
  await mockFileSharing(page);
  await page.goto(pair);
  const menu = await openShareMenu(page);
  const story = menu.getByRole('button', { name: '스토리용 카드 공유', exact: true });
  await expect(story).toBeEnabled({ timeout: 30_000 });
  const captures = await page.evaluate(() => window.__shareRecovery?.captures);
  await story.click();
  await expect(menu.getByRole('status')).toContainText('기기의 파일 공유에 실패했어요.');
  await expect(menu.getByRole('button', { name: '스토리 카드 다시 준비', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.__shareRecovery?.downloads)).toEqual([]);
  await menu.getByRole('button', { name: '완성된 스토리 이미지 직접 저장', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__shareRecovery?.downloads)).toMatchObject([{ name: 'muti-match-story.png', active: true, width: 1080, height: 1920 }]);
  expect(await page.evaluate(() => window.__shareRecovery?.captures)).toBe(captures);
});

test('cancelling card or story sharing never downloads a file or reports a creation error', async ({ page }) => {
  await mockFileSharing(page, { abort: true });
  await page.goto(personal);
  const menu = await openShareMenu(page);
  await expect(menu.getByRole('button', { name: '스토리용 카드 공유', exact: true })).toBeEnabled({ timeout: 30_000 });
  for (const name of ['이미지 저장', '스토리용 카드 공유']) {
    await menu.getByRole('button', { name, exact: true }).click();
    await expect(menu.getByRole('status')).toHaveText('');
    await expect(menu.getByTestId('share-image-fallback')).toHaveCount(0);
    await expect(menu.getByRole('button', { name, exact: true })).toBeEnabled();
  }
  expect(await page.evaluate(() => window.__shareRecovery?.nativeCalls)).toBe(2);
  expect(await page.evaluate(() => window.__shareRecovery?.downloads)).toEqual([]);
});

test('a real image creation failure still uses the prepare-again path, not a file-sharing fallback', async ({ page }) => {
  await mockFileSharing(page, { captureFails: true });
  await page.goto(personal);
  const menu = await openShareMenu(page);
  const retry = menu.getByRole('button', { name: '이미지 다시 준비', exact: true });
  await expect(retry).toBeEnabled({ timeout: 30_000 });
  await expect(menu.getByTestId('share-image-fallback')).toHaveCount(0);
  expect(await page.evaluate(() => window.__shareRecovery?.nativeCalls)).toBe(0);
  await retry.click();
  await expect(menu.getByRole('status')).toContainText('이미지가 준비됐어요. 한 번 더 눌러 공유해 주세요.');
  await expect(menu.getByRole('button', { name: '이미지 저장', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => window.__shareRecovery?.nativeCalls)).toBe(0);
});

for (const [language, copyLabel, manualLabel, selectLabel] of [
  ['ko', '링크 복사', '직접 복사할 결과 링크', '링크 전체 선택'],
  ['en', 'Copy link', 'Result link for manual copying', 'Select the whole link'],
  ['ja', 'リンクをコピー', '手動コピー用の結果リンク', 'リンクをすべて選択'],
]) test(`clipboard rejection reveals a selectable result URL only after a ${language} copy action`, async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Clipboard denied', 'NotAllowedError'); } } }));
  await page.goto(`${personal}&lang=${language}`);
  const menu = await openShareMenu(page);
  await expect(menu.getByTestId('share-manual-link')).toHaveCount(0);
  await menu.getByRole('button', { name: copyLabel, exact: true }).click();
  const link = menu.getByRole('textbox', { name: manualLabel });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('readonly');
  await expect(link).toHaveValue(/\/result\?/);
  const url = new URL(await link.inputValue());
  expect(Object.fromEntries(url.searchParams)).toEqual({ score: 'v1.70.61.79.48.75', sv: '3', lang: language, pv: '3' });
  expect(await link.evaluate(input => Number.parseFloat(getComputedStyle(input).fontSize))).toBeGreaterThanOrEqual(16);
  await menu.getByRole('button', { name: selectLabel, exact: true }).click();
  await expect(link).toBeFocused();
  expect(await link.evaluate(input => { const element = input as HTMLInputElement; return element.selectionEnd! - element.selectionStart!; })).toBe((await link.inputValue()).length);
});

test('sending a link without Share or Clipboard APIs exposes the same manual-copy recovery', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  await page.goto(pair);
  const menu = await openShareMenu(page);
  await expect(menu.getByTestId('share-manual-link')).toHaveCount(0);
  await menu.getByRole('button', { name: '링크로 보내기', exact: true }).click();
  const link = menu.getByRole('textbox', { name: '직접 복사할 결과 링크' });
  await expect(link).toHaveValue(/\/share\?/);
  expect(Object.fromEntries(new URL(await link.inputValue()).searchParams)).toEqual({ host: 'v1.82.46.74.31.68', guest: 'v1.70.61.79.48.75' });
  await expect(menu.getByRole('status')).toContainText('자동 복사가 차단됐어요.');
});
