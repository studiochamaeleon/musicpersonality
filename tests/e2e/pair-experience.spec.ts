import { expect, test } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const a = 'v1.82.46.74.31.68';
const b = 'v1.70.61.79.48.75';

test('identical saved scores can be compared without retaking the quiz or inventing differences', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{
    id: 'same-scores-different-person', scores: { mellow: 50, unpretentious: 50, sophisticated: 50, intense: 50, contemporary: 50 }, topGenreId: 'pop_indie', resultVersion: 3, createdAt: Date.now(),
  }])));
  await page.goto('/#compare=v1.50.50.50.50.50');
  await page.getByRole('button', { name: '최근 결과로 바로 궁합 보기' }).click();
  await expect(page.getByText('100%', { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId('pair-contrast-insight')).toContainText('점수 차이가 없어요');
  await expect(page.getByTestId('pair-contrast-insight')).not.toContainText('가장 다른 취향');
  const row = page.getByTestId('pair-trait-intense');
  await row.locator('summary').click();
  await expect(row).toContainText('중간에 가까운 응답');
  await expect(row.getByRole('meter')).toHaveCount(2);
});

test('opposite profiles explain the absence of common ground and label the shared pick as discovery', async ({ page }) => {
  await page.goto('/#compare=v1.0.0.0.0.0&guest=v1.100.100.100.100.100');
  await expect(page.getByTestId('pair-shared-insight')).toContainText('가까운 축은 아직 없어요');
  await expect(page.getByTestId('pair-shared-insight')).toContainText('모든 축에서 20점보다 큰 차이');
  await expect(page.getByText('함께 시도할 발견곡', { exact: true })).toBeVisible();
  await expect(page.getByText('함께 시작할 곡', { exact: true })).toHaveCount(0);
  await expect(page.getByTestId('pair-track-reason')).toHaveCount(3);
});

test('low matched intensity is explained as restraint and each row identifies both participants', async ({ page }) => {
  await page.goto('/#compare=v1.70.70.70.25.70&guest=v1.70.70.70.30.70');
  const row = page.getByTestId('pair-trait-intense');
  await row.locator('summary').click();
  await expect(row).toContainText('절제된 사운드');
  await expect(row.getByRole('meter', { name: '초대한 사람 · 강렬함' })).toHaveAttribute('aria-valuenow', '25');
  await expect(row.getByRole('meter', { name: '응답한 사람 · 강렬함' })).toHaveAttribute('aria-valuenow', '30');
});

test('either participant result can be opened without swapping identities or legacy versions', async ({ page }) => {
  await page.goto(`/#compare=${a}&guest=${b}&hv=2`);
  const identities = page.getByTestId('pair-identities');
  await expect(identities).toContainText('초대한 사람');
  await expect(identities).toContainText('응답한 사람');
  await page.getByRole('button', { name: '초대한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/v=2&m=82/);
  await page.goBack();
  await page.getByRole('button', { name: '응답한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/v=3&m=70/);
});

test('recent match restores both versions in one tap and can be deleted without deleting personal results', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('music-personality-recent-results-v1')) localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{ id: 'personal', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 }, topGenreId: 'pop_indie', resultVersion: 2, createdAt: Date.now() }]));
  });
  await page.goto(`/#compare=${a}&guest=${b}&hv=2&gv=2`);
  await expect(page.getByRole('heading', { name: '취향을 나란히 보기' })).toBeVisible();
  await page.getByRole('button', { name: '처음으로', exact: true }).click();
  await page.getByRole('button', { name: /최근 궁합 바로 보기/ }).click();
  await expect(page).toHaveURL(/hv=2&gv=2/);
  await page.getByRole('button', { name: '처음으로', exact: true }).click();
  await page.getByRole('button', { name: '이 궁합 삭제 1', exact: true }).click();
  await expect(page.getByTestId('recent-comparisons')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /최근 결과 바로 보기/ })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('recent-comparisons')).toHaveCount(0);
});

for (const [lang, labels] of [
  ['ko', ['초대한 사람', '응답한 사람']],
  ['en', ['Inviter', 'Respondent']],
  ['ja', ['招待した人', '回答した人']],
] as const) test(`pair identities, interpretation, and share card fit narrow ${lang} screens`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto(`/?lang=${lang}#compare=${a}&guest=${b}`);
  const identities = page.getByTestId('pair-identities');
  for (const label of labels) await expect(identities).toContainText(label);
  const card = page.getByTestId('pair-share-card');
  for (const label of labels) await expect(card).toContainText(label);
  await expect(page.getByTestId('pair-track-reason')).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  expect(await card.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  expect(await card.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
});

test('the enriched pair card reaches the iPhone file share sheet within the tap gesture', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (payload: ShareData) => {
        Object.defineProperty(window, '__pairShare', {
          configurable: true,
          value: { active: navigator.userActivation?.isActive, fileName: payload.files?.[0]?.name, bytes: payload.files?.[0]?.size ?? 0 },
        });
      },
    });
  });
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto(`/?lang=ja#compare=${a}&guest=${b}`);
  await openShareMenu(page);
  const save = page.getByRole('button', { name: '画像を保存', exact: true });
  await expect(save).toBeEnabled({ timeout: 30_000 });
  await save.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __pairShare?: { active: boolean; fileName: string; bytes: number } }).__pairShare)).toMatchObject({ active: true, fileName: 'our-music-match.png' });
  expect(await page.evaluate(() => (window as Window & { __pairShare?: { bytes: number } }).__pairShare?.bytes)).toBeGreaterThan(20_000);
});
