import { expect, test } from '@playwright/test';

const japaneseResult = '/?v=2&m=80&u=50&s=85&i=30&c=75&lang=ja';

async function expectWithinViewport(page: import('@playwright/test').Page, selector: string) {
  const bounds = await page.locator(selector).first().evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
}

for (const [locale, heading, startButton, question, result] of [
  ['ko-KR', /취향을 들으면/, '내 음악 성격 찾기', '나는 조용하고 차분한 음악을 선호한다', '명상하는 완벽주의자'],
  ['en-US', /Your taste says/, 'Find my music type', 'I prefer quiet and calm music', 'Essential Minimalist'],
  ['ja-JP', /好きな音を辿れば/, '私の音楽性格を見つける', '静かで穏やかな音楽が好きだ', '瞑想する完璧主義者'],
] as const) {
  test(`first visit follows browser locale ${locale} across pages`, async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', locale, viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', locale.slice(0, 2));
    await page.getByRole('button', { name: startButton }).click();
    await expect(page.getByRole('heading', { level: 1, name: question })).toBeVisible();
    await page.goto('/?v=2&m=80&u=50&s=85&i=30&c=75');
    await expect(page.getByRole('heading', { level: 1, name: result })).toBeVisible();
    await page.goto('/?view=genre-explorer');
    await expect(page.locator('html')).toHaveAttribute('lang', locale.slice(0, 2));
    await page.goto('/privacy');
    await expect(page.locator('html')).toHaveAttribute('lang', locale.slice(0, 2));
    await page.goto('/terms');
    await expect(page.locator('html')).toHaveAttribute('lang', locale.slice(0, 2));
    await context.close();
  });
}

test('URL language overrides browser locale, while a manual choice persists', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', locale: 'ja-JP' });
  const page = await context.newPage();
  await page.goto('/?lang=en');
  await expect(page.getByRole('heading', { level: 1, name: /Your taste says/ })).toBeVisible();
  await page.getByRole('button', { name: '한국어로 보기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /취향을 들으면/ })).toBeVisible();
  await page.goto('/?view=genre-explorer');
  await expect(page.getByRole('heading', { level: 1, name: '장르에도 성격이 있습니다.' })).toBeVisible();
  await context.close();
});

test('Japanese intro, result, and genre explorer fit narrow mobile viewports', async ({ page }) => {
  for (const width of [320, 375, 412]) {
    await page.setViewportSize({ width, height: 812 });

    await page.goto('/?lang=ja');
    await expect(page.getByRole('heading', { level: 1, name: /好きな音を辿れば/ })).toBeVisible();
    await expectWithinViewport(page, 'h1');
    await expectWithinViewport(page, 'header');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

    await page.goto(japaneseResult);
    await expect(page.getByRole('heading', { level: 1, name: '瞑想する完璧主義者' })).toBeVisible();
    await expectWithinViewport(page, 'h1');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await expect.poll(() => page.locator('.shareable-card-container > div').first().evaluate(card => {
      const footer = card.querySelector('footer');
      return footer ? footer.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom : Infinity;
    })).toBeLessThanOrEqual(1);

    await page.goto('/?view=genre-explorer&lang=ja');
    await expect(page.getByRole('heading', { level: 1, name: 'ジャンルにも、性格がある。' })).toBeVisible();
    await expectWithinViewport(page, 'h1');
    await expectWithinViewport(page, 'button.result-card');
    await page.getByRole('button', { name: /ミニマリズム/ }).first().click();
    await expect(page.getByRole('dialog', { name: 'ミニマリズム' })).toBeVisible();
    await expectWithinViewport(page, '[role="dialog"]');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
