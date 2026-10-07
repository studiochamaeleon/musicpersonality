import { expect, test } from '@playwright/test';

test('browser back and forward restore the explorer and an unfinished quiz', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '장르별 성향 먼저 보기' }).click();
  await expect(page.getByRole('heading', { name: '장르에도 성격이 있습니다.' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('button', { name: '내 음악 성격 찾기' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: '장르에도 성격이 있습니다.' })).toBeVisible();
  await page.goBack();
  await page.getByRole('button', { name: '내 음악 성격 찾기' }).click();
  await expect(page).toHaveURL(/view=survey/);
  await page.getByRole('radio', { name: '4: 그렇다' }).click();
  const secondQuestion = page.getByRole('heading', { level: 1 });
  await expect(secondQuestion).not.toHaveText('나는 조용하고 차분한 음악을 선호한다');
  const text = await secondQuestion.textContent();
  await page.goBack();
  await expect(page.getByRole('button', { name: '내 음악 성격 찾기' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(text || '');
  await page.getByRole('button', { name: '이전', exact: true }).click();
  await expect(page.getByRole('radio', { name: '4: 그렇다' })).toHaveAttribute('aria-checked', 'true');
});

test('changing language preserves the in-app back destination', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '장르별 성향 먼저 보기' }).click();
  await page.getByRole('button', { name: 'View in English' }).click();
  await expect(page.getByRole('heading', { name: 'Every genre has a personality.' })).toBeVisible();
  await page.getByRole('button', { name: /Back to Home/ }).click();
  await expect(page.getByRole('button', { name: 'Find my music type' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => history.state?.mutiDepth)).toBe(0);
});

test('a v2 result survives invite, pair reload, personal view, and browser back', async ({ page }) => {
  await page.goto('/?v=2&m=82&u=46&s=74&i=31&c=68');
  const hostGenre = await page.getByRole('heading', { level: 1 }).textContent();
  await page.getByRole('button', { name: '친구와 음악 궁합 보기' }).click();
  await expect(page).toHaveURL(/hv=2/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(hostGenre || '');
  await page.goForward();
  await expect(page.getByRole('heading', { name: '친구에게 보내고, 취향을 비교해보세요.' })).toBeVisible();

  await page.goto('/#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75&hv=2&gv=2');
  await page.reload();
  await expect(page.getByRole('heading', { name: '같이 재생할 세 곡' })).toBeVisible();
  await page.getByRole('button', { name: '응답한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/v=2&m=70&u=61&s=79&i=48&c=75/);
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '같이 재생할 세 곡' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
});

test('a saved v2 result is reused for comparison without being silently rescored', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{
    id: 'legacy-guest', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 },
    topGenreId: 'pop_indie', resultVersion: 2, questionVersion: 2, createdAt: Date.now(),
  }])));
  await page.goto('/#compare=v1.82.46.74.31.68&hv=2');
  await page.getByRole('button', { name: '최근 결과로 바로 궁합 보기' }).click();
  await expect(page).toHaveURL(/&hv=2&gv=2/);
  await expect(page.getByText('함께 시작할 곡', { exact: true })).toBeVisible();
  await expect(page.getByText('초대한 사람의 소개곡', { exact: true })).toBeVisible();
  await expect(page.getByText('응답한 사람의 소개곡', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: '응답한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/v=2&m=70/);
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
});
