import { expect, test } from '@playwright/test';

const hostToken = 'v1.82.46.74.31.68';
const guestToken = 'v1.70.61.79.48.75';

test('an invited friend can finish the survey and see the pair result', async ({ page }) => {
  await page.goto(`/#compare=${hostToken}`);
  await expect(page.getByRole('heading', { name: '친구가 음악 궁합을 기다리고 있어요.' })).toBeVisible();

  await page.getByRole('button', { name: '내 음악 성격 검사하기' }).click();
  await expect(page.getByRole('heading', { name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();

  for (let index = 0; index < 40; index += 1) {
    const currentQuestion = await page.getByRole('heading', { level: 1 }).textContent();
    await page.getByRole('radio', { name: /^3:/ }).click();
    if (index < 39) await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(currentQuestion || '');
  }

  await expect(page.getByRole('heading', { level: 1, name: /플레이리스트|사이|균형|발견/ })).toBeVisible();
  await expect(page).toHaveURL(/#compare=v1\.[\d.]+&guest=v1\.[\d.]+$/);
  await expect(page.getByRole('heading', { name: '취향을 나란히 보기' })).toBeVisible();
});

test('a pair result link restores and opens the guest personal result', async ({ page }) => {
  await page.goto(`/#compare=${hostToken}&guest=${guestToken}`);
  await expect(page.getByText('89%', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: '거의 같은 플레이리스트' })).toBeVisible();

  await page.getByRole('button', { name: '내 개인 결과 보기' }).click();
  await expect(page).toHaveURL(/\?v=2&m=70&u=61&s=79&i=48&c=75$/);
  await expect(page.getByRole('button', { name: '친구와 음악 궁합 보기' })).toBeVisible();
});

test('the compatibility card downloads as a non-empty PNG', async ({ page }) => {
  await page.goto(`/#compare=${hostToken}&guest=${guestToken}`);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '이미지 저장' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('our-music-match.png');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const image = Buffer.concat(chunks);
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.length).toBeGreaterThan(20_000);
});

test('the personal result card downloads as a non-empty PNG', async ({ page }) => {
  await page.goto('/?v=1&m=70&u=61&s=79&i=48&c=75');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '이미지 저장' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('music-personality-result.png');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const image = Buffer.concat(chunks);
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.length).toBeGreaterThan(20_000);
});

test('the prepared image reaches the Apple share sheet during the tap gesture', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (payload: ShareData) => {
        Object.defineProperty(window, '__capturedShare', {
          configurable: true,
          value: { active: navigator.userActivation?.isActive, files: payload.files?.length ?? 0 },
        });
      },
    });
  });
  await page.goto('/?v=2&m=70&u=61&s=79&i=48&c=75');
  const save = page.getByRole('button', { name: '이미지 저장' });
  await expect(save).toBeEnabled({ timeout: 30_000 });
  await save.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __capturedShare?: { active: boolean; files: number } }).__capturedShare)).toEqual({ active: true, files: 1 });
});

test('the personal result offers curated direct Spotify album links', async ({ page }) => {
  await page.goto('/?v=1&m=70&u=61&s=79&i=48&c=75');
  const albumLinks = page.getByRole('link', { name: /Spotify에서 앨범 듣기/ });
  await expect(albumLinks).toHaveCount(6);

  const hrefs = await albumLinks.evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(6);
  for (const href of hrefs) expect(href).toMatch(/^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/);
});

test('the genre explorer reuses the fixed dot matrix background', async ({ page }) => {
  await page.goto('/?view=genre-explorer');
  await expect(page.getByRole('heading', { name: '장르에도 성격이 있습니다.' })).toBeVisible();

  const backgroundCanvas = page.locator('main canvas').first();
  await expect(backgroundCanvas).toBeVisible();
  await expect(backgroundCanvas.locator('..')).toHaveCSS('position', 'fixed');
});

test('the personal result keeps viral actions within reach on mobile', async ({ page }) => {
  await page.goto('/?v=1&m=70&u=61&s=79&i=48&c=75');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 700));

  const stickyActions = page.getByTestId('mobile-result-actions');
  await expect(stickyActions).toBeVisible();
  await expect(stickyActions.getByRole('button', { name: '친구와 음악 궁합 보기' })).toBeVisible();
});
