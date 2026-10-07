import { expect, test } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const pair = '/#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75';
const personal = '/?v=3&m=70&u=61&s=79&i=48&c=75';

test('creating an invite prioritizes sending it and keeps that intent through reload and history', async ({ page, context }) => {
  await page.goto(personal);
  await page.getByRole('button', { name: '친구와 음악 궁합 보기', exact: true }).first().click();
  const invitation = page.url();
  await expect(page.getByRole('button', { name: '초대 링크 보내기', exact: true })).toHaveClass(/primary-action/);
  await expect(page.getByRole('button', { name: '최근 결과로 바로 궁합 보기' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '내 음악 성격 검사하기' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: '친구에게 보내고, 취향을 비교해보세요.' })).toBeVisible();
  await page.getByRole('button', { name: '내 결과로 돌아가기' }).click();
  await expect(page).toHaveURL(/v=3&m=70/);
  await page.goForward();
  await expect(page.getByRole('heading', { name: '친구에게 보내고, 취향을 비교해보세요.' })).toBeVisible();
  const recipient = await context.newPage();
  await recipient.goto(invitation);
  await expect(recipient.getByRole('button', { name: '내 음악 성격 검사하기' })).toHaveClass(/primary-action/);
  await recipient.close();
});

test('received invitations prioritize a labeled saved result and offer other saved versions', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([
    { id: 'new', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 }, topGenreId: 'hiphop_jazz', resultVersion: 3, createdAt: Date.now() },
    { id: 'old', scores: { mellow: 82, unpretentious: 46, sophisticated: 74, intense: 31, contemporary: 68 }, topGenreId: 'classical_minimalism', resultVersion: 2, createdAt: Date.now() - 1 },
  ])));
  await page.goto('/#compare=v1.20.30.40.50.60');
  await expect(page.getByTestId('use-recent-primary')).toHaveClass(/primary-action/);
  await expect(page.getByText('사용할 저장 결과', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '새로 검사해서 비교하기' })).toHaveClass(/secondary-action/);
  const choices = page.locator('details').filter({ has: page.locator('summary', { hasText: '다른 저장 결과 선택' }) });
  await choices.locator('summary').click();
  const alternateResult = choices.getByRole('button');
  // Settle the automated scroll before clicking: WebKit may otherwise keep
  // moving the target under the pointer while the page's smooth scroll runs.
  await alternateResult.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await alternateResult.click();
  await expect(page).toHaveURL(/guest=v1.82.46.74.31.68&gv=2/);
});

test('a new invite explicitly uses the selected participant without silently choosing the respondent', async ({ page }) => {
  await page.goto(`${pair}&hv=2`);
  const choices = page.locator('details').filter({ has: page.locator('summary', { hasText: '다른 친구와 비교하기' }) });
  await choices.locator('summary').click();
  await choices.getByRole('button', { name: '초대한 사람의 결과로 초대', exact: true }).click();
  await expect(page).toHaveURL(/#compare=v1.82.46.74.31.68&hv=2$/);
  await expect(page.getByRole('heading', { name: '친구에게 보내고, 취향을 비교해보세요.' })).toBeVisible();
});

test('personal and pair sharing use the same accessible menu and restore focus on Escape', async ({ page }) => {
  for (const path of [personal, pair]) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: '이미지 저장', exact: true })).toHaveCount(0);
    const trigger = page.locator('[data-testid$="-share-trigger"]');
    const menu = await openShareMenu(page);
    for (const label of ['링크로 보내기', '스토리용 카드 공유', '이미지 저장', '링크 복사']) await expect(menu.getByRole('button', { name: label, exact: true })).toBeEnabled({ timeout: 30_000 });
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  }
});

test('the sticky personal action opens the sharing menu rather than sharing before a choice', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { (window as Window & { shared?: boolean }).shared = true; } }));
  await page.goto(personal);
  await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 1100, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(480);
  const actions = page.getByTestId('mobile-result-actions');
  await expect(actions).toBeVisible();
  await actions.getByRole('button', { name: '결과 공유하기' }).click();
  const menu = page.getByTestId('personal-share-menu');
  await expect(menu).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { shared?: boolean }).shared)).toBeUndefined();
  await menu.getByRole('button', { name: '링크로 보내기' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { shared?: boolean }).shared)).toBe(true);
});

test('pair story sharing preserves the tap gesture and produces a 1080x1920 PNG', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (payload: ShareData) => {
      const file = payload.files?.[0];
      const active = navigator.userActivation?.isActive;
      if (!file) return;
      const bytes = new DataView(await file.arrayBuffer());
      (window as Window & { story?: unknown }).story = { active, name: file.name, width: bytes.getUint32(16), height: bytes.getUint32(20), bytes: file.size };
    } });
  });
  await page.goto(pair);
  const menu = await openShareMenu(page);
  const story = menu.getByRole('button', { name: '스토리용 카드 공유', exact: true });
  await expect(story).toBeEnabled({ timeout: 30_000 });
  await story.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { story?: unknown }).story)).toMatchObject({ active: true, name: 'muti-match-story.png', width: 1080, height: 1920 });
});

test('changing a pair track preserves scores, unique songs, focus, and role labels', async ({ page }) => {
  await page.goto(pair);
  const initial = await page.getByTestId('pair-track-shared').getByRole('link').getAttribute('href');
  const resultUrl = page.url();
  for (const role of ['shared', 'host', 'guest', 'shared']) {
    const slot = page.getByTestId(`pair-track-${role}`);
    const before = await slot.getByRole('link').getAttribute('href');
    const button = slot.getByRole('button', { name: '다른 곡으로 듣기', exact: true });
    await button.focus();
    await button.press('Enter');
    await expect(button).toBeFocused();
    await expect(slot.getByRole('link')).not.toHaveAttribute('href', before!);
    const urls = await page.getByRole('link', { name: /Spotify에서 함께 듣기/ }).evaluateAll(links => links.map(link => link.getAttribute('href')));
    expect(new Set(urls).size).toBe(3);
    await expect(page.getByText('89%', { exact: true }).first()).toBeVisible();
    expect(page.url()).toBe(resultUrl);
  }
  await page.reload();
  await expect(page.getByTestId('pair-track-shared').getByRole('link')).toHaveAttribute('href', initial!);
});

test('feedback is optional, separates ratings, and only copies a preview without raw scores or links', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { (window as Window & { copiedFeedback?: string }).copiedFeedback = value; } } }));
  await page.goto(personal);
  const feedback = page.getByTestId('result-feedback');
  await expect(feedback).not.toHaveAttribute('open');
  await feedback.locator('summary').first().click();
  await expect(feedback.getByRole('button', { name: '피드백 내용 복사' })).toBeDisabled();
  await feedback.getByLabel('음악 장르', { exact: true }).selectOption('fits');
  await feedback.getByLabel('음악 캐릭터 설명', { exact: true }).selectOption('misses');
  await feedback.getByLabel('추천곡', { exact: true }).selectOption('unsure');
  await feedback.getByRole('textbox').fill('이 질문은 소리의 크기인지 밀도인지 헷갈렸어요.');
  await feedback.getByRole('button', { name: '피드백 내용 복사' }).click();
  const report = await page.evaluate(() => (window as Window & { copiedFeedback?: string }).copiedFeedback);
  expect(report).toContain('음악 장르: 잘 맞아요');
  expect(report).toContain('음악 캐릭터 설명: 잘 안 맞아요');
  expect(report).toContain('추천곡: 애매해요');
  expect(report).not.toContain('mellow');
  expect(report).not.toContain('https://');
  await page.reload();
  await feedback.locator('summary').first().click();
  await expect(feedback.getByRole('textbox')).toHaveValue('');
});

for (const lang of ['ko', 'en', 'ja']) test(`the shared menu fits a 320px ${lang} viewport`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`/?lang=${lang}#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75`);
  const menu = await openShareMenu(page);
  expect(await menu.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  const bounds = await menu.boundingBox();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320);
  await expect(menu.getByRole('button').first()).toBeVisible();
});
