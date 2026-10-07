import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });

for (const [lang, clear, reset, remove, deleted, failed] of [
  ['ko', '검색어 지우기', '필터 초기화', '이 검사 결과 삭제', '이 브라우저에서 저장된 결과를 삭제했어요.', '저장된 결과를 삭제하지 못했어요.'],
  ['en', 'Clear search', 'Reset filters', 'Delete this test result', 'The saved result was deleted from this browser.', 'Could not delete the saved result.'],
  ['ja', '検索をクリア', 'フィルターをリセット', 'このテスト結果を削除', 'このブラウザーの保存済み結果を削除しました。', '保存した結果を削除できませんでした。'],
] as const) {
  test(`${lang} search clearing and filter reset keep keyboard focus in a usable field`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/?view=genre-explorer&lang=${lang}`);
    const search = page.locator('.genre-explorer input');
    await search.fill('NewJeans');
    const clearButton = page.getByRole('button', { name: clear, exact: true });
    await clearButton.focus();
    await clearButton.press('Enter');
    await expect(search).toBeFocused();
    await expect(search).toHaveValue('');
    await expect(page.locator('button.result-card')).toHaveCount(34);
    await search.fill('Nujabes');
    await search.press('Escape');
    await expect(search).toBeFocused();
    await expect(search).toHaveValue('');
    await page.getByRole('button', { name: /J-POP/ }).click();
    await page.getByRole('button', { name: reset, exact: true }).first().click();
    await expect(search).toBeFocused();
    await expect(page.getByRole('button', { name: /J-POP/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test(`${lang} saved-result deletion is announced, restores focus, and reports storage rejection honestly`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([
        { id: 'one', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 }, topGenreId: 'hiphop_jazz', resultVersion: 3, createdAt: Date.now() },
        { id: 'two', scores: { mellow: 82, unpretentious: 46, sophisticated: 74, intense: 31, contemporary: 68 }, topGenreId: 'classical_minimalism', resultVersion: 3, createdAt: Date.now() - 1 },
      ]));
    });
    await page.goto(`/?lang=${lang}`);
    const languages = page.locator('main header button');
    for (const button of await languages.all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const older = page.locator('main details summary').first();
    expect((await older.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.getByRole('button', { name: `${remove} 1`, exact: true }).click();
    await expect(page.getByTestId('history-delete-status')).toHaveText(deleted);
    await expect(page.getByTestId('recent-personal-result')).toBeFocused();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('music-personality-recent-results-v1')!)[0].id)).toBe('two');
    await page.evaluate(() => {
      const original = Storage.prototype.removeItem;
      Storage.prototype.removeItem = function (key) {
        if (this === localStorage && key === 'music-personality-recent-results-v1') throw new DOMException('Denied', 'SecurityError');
        return original.call(this, key);
      };
    });
    const deletion = page.getByRole('button', { name: `${remove} 1`, exact: true });
    await deletion.focus();
    await deletion.press('Enter');
    await expect(page.getByTestId('history-delete-status')).toContainText(failed);
    await expect(deletion).toBeFocused();
    await expect(page.getByTestId('recent-personal-result')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
}

test('long explorer pages render only a viewport-sized dot canvas, which follows scrolling and resizing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/?view=genre-explorer');
  await expect(page.locator('button.result-card')).toHaveCount(34);
  const canvas = page.locator('.genre-explorer-canvas canvas');
  const metrics = await canvas.evaluate((node: HTMLCanvasElement) => ({
    cssHeight: node.getBoundingClientRect().height, bitmapHeight: node.height,
    pageHeight: document.documentElement.scrollHeight, viewport: innerHeight, dpr: Math.min(devicePixelRatio, 1.5),
  }));
  expect(metrics.pageHeight).toBeGreaterThan(metrics.viewport * 3);
  expect(metrics.cssHeight).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.bitmapHeight).toBeLessThanOrEqual(Math.ceil(metrics.viewport * metrics.dpr));
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(-1);
  expect((await canvas.boundingBox())!.y).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 568, height: 320 });
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().height)).toBe(320);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.getContext('2d')!.getImageData(0, 0, 1, 1).data[3])).toBe(255);
});

test('expanded home history does not turn the animated background into a full-page bitmap', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([70, 60, 50].map((score, index) => ({
      id: `history-${index}`, scores: { mellow: score, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 },
      topGenreId: 'hiphop_jazz', resultVersion: 3, createdAt: Date.now() - index,
    }))));
  });
  await page.goto('/');
  await page.locator('main details summary').first().click();
  const canvas = page.locator('main canvas');
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().height)).toBe(568);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(700);
  // The shared legal footer is outside this background's main container.
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('main')!.getBoundingClientRect().bottom + scrollY - innerHeight, behavior: 'instant' }));
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(-1);
  expect((await canvas.boundingBox())!.y).toBeLessThanOrEqual(1);
});

test('dot motion responds to a live reduced-motion change and pauses while the page is hidden', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const canvas = page.locator('main canvas');
  await expect(canvas).toBeVisible();
  const pixels = () => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const moving = await pixels();
  await expect.poll(pixels).not.toBe(moving);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100); // Allow the preference-change event to paint its static frame.
  const still = await pixels();
  await page.waitForTimeout(180); // Observe several animation frames, not a loading delay.
  expect(await pixels()).toBe(still);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(pixels).not.toBe(still);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await pixels();
  await page.waitForTimeout(180);
  expect(await pixels()).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(pixels).not.toBe(hidden);
});
