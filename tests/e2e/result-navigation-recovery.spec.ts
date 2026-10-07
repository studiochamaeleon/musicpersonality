import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });
const pair = '/#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75&hv=2&gv=2';
const personal = '/?v=2&m=70&u=61&s=79&i=48&c=75';

test('pair section links keep both profiles and versions through clicks, refresh, and browser back', async ({ page }) => {
  for (const lang of ['ko', 'en', 'ja']) {
    await page.goto(`/?lang=${lang}`);
    await page.goto(pair.replace('/#', `/?lang=${lang}#`));
    const resultUrl = page.url();
    const historyLength = await page.evaluate(() => history.length);
    const links = page.locator('main nav a');
    await expect(links).toHaveCount(3);
    for (let index = 0; index < 3; index++) {
      const target = await links.nth(index).getAttribute('href');
      await links.nth(index).click();
      await expect(page.locator(target!)).toBeFocused();
      await expect(page.getByTestId('pair-track-shared')).toHaveCount(1);
      expect(page.url()).toBe(resultUrl);
      expect(await page.evaluate(() => history.length)).toBe(historyLength);
    }
    await page.reload();
    await expect(page.getByTestId('pair-identities')).toBeVisible();
    expect(page.url()).toBe(resultUrl);
    await page.goBack();
    await expect(page.locator('.intro-facts')).toBeVisible();
  }
});

test('personal section links move focus without adding phantom history entries or altering the result', async ({ page }) => {
  await page.goto('/');
  await page.goto(personal);
  const resultUrl = page.url();
  const historyLength = await page.evaluate(() => history.length);
  await page.getByRole('link', { name: '나의 취향 스펙트럼', exact: true }).click();
  await expect(page.locator('#spectrum')).toBeFocused();
  for (const link of await page.locator('main nav a').all()) {
    const target = await link.getAttribute('href');
    await link.click();
    await expect(page.locator(target!)).toBeFocused();
  }
  expect(page.url()).toBe(resultUrl);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.intro-facts')).toBeVisible();
});

test('personal results can be deleted individually in every language without deleting saved matches', async ({ page }) => {
  for (const [lang, remove] of [['ko', '이 검사 결과 삭제'], ['en', 'Delete this test result'], ['ja', 'このテスト結果を削除']] as const) {
    await page.goto(`/?lang=${lang}`);
    await page.evaluate(() => {
      const scores = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
      localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([
        { id: 'new', scores, resultVersion: 3, topGenreId: 'hiphop_jazz', createdAt: Date.now() },
        { id: 'legacy', scores, resultVersion: 2, topGenreId: 'pop_indie', createdAt: Date.now() - 1 },
      ]));
      localStorage.setItem('muti-recent-comparisons-v1', JSON.stringify([{ hostScores: scores, guestScores: scores, hostVersion: 2, guestVersion: 3, createdAt: Date.now() }]));
    });
    await page.reload();
    await expect(page.getByRole('button', { name: `${remove} 1`, exact: true })).toBeVisible();
    const pairStorage = await page.evaluate(() => localStorage.getItem('muti-recent-comparisons-v1'));
    await page.getByRole('button', { name: `${remove} 1`, exact: true }).click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('music-personality-recent-results-v1')!).length)).toBe(1);
    await page.getByTestId('recent-personal-result').click();
    await expect(page).toHaveURL(/v=2&m=70/);
    await page.goBack();
    await page.getByRole('button', { name: `${remove} 1`, exact: true }).click();
    await expect(page.getByTestId('recent-personal-result')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('muti-recent-comparisons-v1'))).toBe(pairStorage);
    await page.reload();
    await expect(page.getByTestId('recent-personal-result')).toHaveCount(0);
  }
});

test('saving and removing results in another tab updates the intro without a reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('.intro-facts')).toBeVisible();
  const other = await context.newPage();
  await other.goto('/');
  await other.evaluate(() => {
    const scores = { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 };
    localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{ id: 'from-another-tab', scores, resultVersion: 2, topGenreId: 'pop_indie', createdAt: Date.now() }]));
    localStorage.setItem('muti-recent-comparisons-v1', JSON.stringify([{ hostScores: scores, guestScores: scores, hostVersion: 2, guestVersion: 3, createdAt: Date.now() }]));
  });
  await expect(page.getByTestId('recent-personal-result')).toContainText('인디 팝');
  await expect(page.getByTestId('recent-comparisons')).toBeVisible();
  await other.evaluate(() => localStorage.removeItem('music-personality-recent-results-v1'));
  await expect(page.getByTestId('recent-personal-result')).toHaveCount(0);
  await expect(page.getByTestId('recent-comparisons')).toBeVisible();
  await other.evaluate(() => localStorage.removeItem('muti-recent-comparisons-v1'));
  await expect(page.getByTestId('recent-comparisons')).toHaveCount(0);
  await other.close();
});

test('returning from a received invite after comparing a saved legacy profile keeps its personal result version', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{
    id: 'legacy', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 }, resultVersion: 2, topGenreId: 'pop_indie', createdAt: Date.now(),
  }])));
  await page.goto('/#compare=v1.82.46.74.31.68&hv=2');
  await page.getByRole('button', { name: '최근 결과로 바로 궁합 보기', exact: true }).click();
  await expect(page).toHaveURL(/hv=2&gv=2/);
  await page.goBack();
  await page.getByRole('button', { name: '돌아가기', exact: true }).click();
  await expect(page).toHaveURL(/v=2&m=70&u=61&s=79&i=48&c=75/);
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
});
