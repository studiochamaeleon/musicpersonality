import { expect, test } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const hostToken = 'v1.82.46.74.31.68';
const guestToken = 'v1.70.61.79.48.75';

test('an invited friend can finish the survey and see the pair result', async ({ page }) => {
  await page.goto(`/#compare=${hostToken}`);
  await expect(page.getByRole('heading', { name: '우리의 음악 취향, 얼마나 닮았을까요?' })).toBeVisible();

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
  await expect(page.getByRole('heading', { name: '같이 재생할 세 곡' })).toBeVisible();
  const pairTracks = page.getByRole('link', { name: /Spotify에서 함께 듣기/ });
  await expect(pairTracks).toHaveCount(3);
  const trackUrls = await pairTracks.evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(new Set(trackUrls).size).toBe(3);
  for (const url of trackUrls) expect(url).toMatch(/^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);

  await page.getByRole('button', { name: '응답한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/\?v=3&m=70&u=61&s=79&i=48&c=75$/);
  await expect(page.getByRole('button', { name: '친구와 음악 궁합 보기' })).toBeVisible();
});

test('the compatibility card downloads as a non-empty PNG', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile-webkit', 'iPhone uses the file share sheet instead of a browser download event');
  await page.goto(`/#compare=${hostToken}&guest=${guestToken}`);
  await openShareMenu(page);
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
  test.skip(test.info().project.name === 'mobile-webkit', 'iPhone uses the file share sheet instead of a browser download event');
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  await openShareMenu(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '이미지 저장' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('muti-result.png');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const image = Buffer.concat(chunks);
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.length).toBeGreaterThan(20_000);
});

test('the story card downloads as a 9:16 PNG when file sharing is unavailable', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile-webkit', 'Safari may open a blob image rather than emit a browser download event');
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  await openShareMenu(page);
  const storyButton = page.getByRole('button', { name: '스토리용 카드 공유' });
  await expect(storyButton).toBeEnabled({ timeout: 30_000 });
  await openShareMenu(page);
  const downloadPromise = page.waitForEvent('download');
  await storyButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('muti-story.png');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const image = Buffer.concat(chunks);
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.readUInt32BE(16)).toBe(1080);
  expect(image.readUInt32BE(20)).toBe(1920);
  expect(image.length).toBeGreaterThan(30_000);
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
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  await openShareMenu(page);
  const save = page.getByRole('button', { name: '이미지 저장' });
  await expect(save).toBeEnabled({ timeout: 30_000 });
  await save.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __capturedShare?: { active: boolean; files: number } }).__capturedShare)).toEqual({ active: true, files: 1 });
});

test('the prepared story image reaches the mobile share sheet during the tap gesture', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (payload: ShareData) => {
        Object.defineProperty(window, '__capturedStoryShare', {
          configurable: true,
          value: { active: navigator.userActivation?.isActive, files: payload.files?.length ?? 0, name: payload.files?.[0]?.name },
        });
      },
    });
  });
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  await openShareMenu(page);
  const storyButton = page.getByRole('button', { name: '스토리용 카드 공유' });
  await expect(storyButton).toBeEnabled({ timeout: 30_000 });
  await storyButton.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __capturedStoryShare?: { active: boolean; files: number; name: string } }).__capturedStoryShare)).toEqual({ active: true, files: 1, name: 'muti-story.png' });
});

test('the personal result offers four genre tracks plus one scene-bridge track', async ({ page }) => {
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  const trackLinks = page.getByRole('link', { name: /Spotify에서 곡 듣기/ });
  await expect(trackLinks).toHaveCount(5);

  const hrefs = await trackLinks.evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(5);
  for (const href of hrefs) expect(href).toMatch(/^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
});

test('a saved result is directly visible on the intro and opens in one tap', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{
      id: 'saved-result',
      scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 },
      topGenreId: 'classical_minimalism',
      createdAt: Date.now(),
    }]));
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /최근 결과 바로 보기/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /최근 결과 바로 보기/ })).toContainText('인디 팝');
  await page.getByRole('button', { name: /최근 결과 바로 보기/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
  await expect(page.getByText('장르 유사도').first()).toBeVisible();
});

test('the genre explorer reuses the fixed dot matrix background', async ({ page }) => {
  await page.goto('/?view=genre-explorer');
  await expect(page.getByRole('heading', { name: '장르에도 성격이 있습니다.' })).toBeVisible();

  const backgroundCanvas = page.locator('main canvas').first();
  await expect(backgroundCanvas).toBeVisible();
  await expect(backgroundCanvas.locator('..')).toHaveCSS('position', 'fixed');
});

test('the personal result keeps viral actions within reach on mobile', async ({ page }) => {
  await page.goto('/?v=3&m=70&u=61&s=79&i=48&c=75');
  await expect(page.locator('.shareable-card-container > div').first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 700));

  const stickyActions = page.getByTestId('mobile-result-actions');
  await expect(stickyActions).toBeVisible();
  await expect(stickyActions.getByRole('button', { name: '친구와 음악 궁합 보기' })).toBeVisible();
});
