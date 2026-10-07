import { expect, test } from '@playwright/test';
import questions from '../../src/data/questions.json';

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });

for (const [lang, message, reveal, select] of [
  ['ko', '이번 결과를 이 브라우저에 저장하지 못했어요.', '보관할 결과 링크 보기', '링크 전체 선택'],
  ['en', 'This result could not be saved in this browser.', 'Show my result link', 'Select the whole link'],
  ['ja', '今回の結果をこのブラウザーに保存できませんでした。', '保存する結果リンクを見る', 'リンクをすべて選択'],
] as const) {
  test(`${lang} preserves a completed result when recent-history writes fail and offers its exact link without sharing`, async ({ page }) => {
    await page.addInitScript(({ answers }) => {
      const original = Storage.prototype.setItem;
      original.call(sessionStorage, 'music-personality-survey', JSON.stringify({ questionVersion: 3, currentStep: 40, answers, startTime: new Date().toISOString(), isComplete: false }));
      original.call(localStorage, 'music-personality-recent-results-v1', JSON.stringify([{ id: 'prior', scores: { mellow: 20, unpretentious: 20, sophisticated: 20, intense: 20, contemporary: 20 }, topGenreId: 'pop_indie', resultVersion: 2, createdAt: Date.now() }]));
      Storage.prototype.setItem = function (key, value) {
        if (this === localStorage && key === 'music-personality-recent-results-v1') throw new DOMException('Storage full', 'QuotaExceededError');
        return original.call(this, key, value);
      };
      Object.assign(window, { recoveryShareCalls: 0 });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { Object.assign(window, { recoveryShareCalls: 1 }); } });
    }, { answers: Object.fromEntries(questions.slice(0, -1).map(question => [question.id, 3])) });
    await page.goto(`/?view=survey&lang=${lang}`);
    await page.getByRole('radio', { name: /^3:/ }).click();
    await expect(page).toHaveURL(/v=3&m=50&u=50&s=50&i=50&c=50/);
    const notice = page.getByTestId('history-save-notice');
    await expect(notice.getByText(message, { exact: true })).toBeVisible();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByTestId('screen-recovery')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('music-personality-recent-results-v1')!)[0].id)).toBe('prior');
    await expect(page.getByTestId('unsaved-result-link')).toHaveCount(0);
    await notice.getByRole('button', { name: reveal, exact: true }).click();
    const field = page.getByTestId('unsaved-result-link');
    const value = await field.inputValue();
    const link = new URL(value);
    expect(link.pathname).toBe('/result');
    expect(link.searchParams.get('score')).toBe('v1.50.50.50.50.50');
    expect(link.searchParams.get('sv')).toBe('3');
    expect(link.searchParams.get('lang')).toBe(lang);
    await notice.getByRole('button', { name: select, exact: true }).click();
    await expect(field).toBeFocused();
    expect(await field.evaluate((node: HTMLInputElement) => node.selectionEnd! - node.selectionStart!)).toBe(value.length);
    expect(await page.evaluate(() => (window as unknown as { recoveryShareCalls: number }).recoveryShareCalls)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('successful personal-history writes and received result links never show a false save warning', async ({ page }) => {
  await page.addInitScript(({ answers }) => sessionStorage.setItem('music-personality-survey', JSON.stringify({ questionVersion: 3, currentStep: 40, answers, startTime: new Date().toISOString(), isComplete: false })), { answers: Object.fromEntries(questions.slice(0, -1).map(question => [question.id, 3])) });
  await page.goto('/?view=survey');
  await page.getByRole('radio', { name: /^3:/ }).click();
  await expect(page.locator('main h1')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('music-personality-recent-results-v1') || '[]').length)).toBe(1);
  await expect(page.getByTestId('history-save-notice')).toHaveCount(0);
  await page.goto('/?v=2&m=70&u=61&s=79&i=48&c=75');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.getByTestId('history-save-notice')).toHaveCount(0);
});

test('failed match-history writes preserve both participant versions and keep prior matches untouched', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    const scores = { mellow: 20, unpretentious: 20, sophisticated: 20, intense: 20, contemporary: 20 };
    original.call(localStorage, 'muti-recent-comparisons-v1', JSON.stringify([{ hostScores: scores, guestScores: scores, hostVersion: 2, guestVersion: 2, createdAt: Date.now() }]));
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === 'muti-recent-comparisons-v1') throw new DOMException('Denied', 'SecurityError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/?lang=ja#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75&hv=2&gv=3');
  await expect(page.getByTestId('pair-identities')).toBeVisible();
  const notice = page.getByTestId('history-save-notice');
  await expect(notice).toBeVisible();
  await notice.getByRole('button', { name: '保存する結果リンクを見る', exact: true }).click();
  const link = new URL(await page.getByTestId('unsaved-result-link').inputValue());
  expect(link.pathname).toBe('/share');
  expect(link.searchParams.get('host')).toBe('v1.82.46.74.31.68');
  expect(link.searchParams.get('guest')).toBe('v1.70.61.79.48.75');
  expect(link.searchParams.get('hv')).toBe('2');
  // Current-version comparison links omit gv; an absent value means version 3.
  expect(link.searchParams.get('gv') ?? '3').toBe('3');
  expect(link.searchParams.get('lang')).toBe('ja');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('muti-recent-comparisons-v1')!)[0].guestScores.mellow)).toBe(20);
});
