import { expect, test } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const personal = '/?v=3&m=70&u=61&s=79&i=48&c=75';
const pair = '/#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75';

test.use({ reducedMotion: 'reduce' });

for (const lang of ['ko', 'en', 'ja']) {
  test(`the ${lang} intro hierarchy fits a 320px viewport without crowding the header`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/?lang=${lang}`);
    await expect(page.locator('main h1')).toBeVisible();
    const layout = await page.evaluate(() => {
      const header = document.querySelector('main header')!.getBoundingClientRect();
      const heading = document.querySelector('main h1')!.getBoundingClientRect();
      const facts = document.querySelector('.intro-facts')!.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth - innerWidth, headerBottom: header.bottom, headingTop: heading.top, factsRight: facts.right };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.headingTop).toBeGreaterThan(layout.headerBottom);
    expect(layout.factsRight).toBeLessThanOrEqual(321);
  });
}

test('personal and pair section shortcuts point to complete sections in all languages', async ({ page }) => {
  for (const lang of ['ko', 'en', 'ja']) {
    for (const [path, count] of [[personal, 4], [pair, 3]] as const) {
      const url = path.includes('#') ? path.replace('/#', `/?lang=${lang}#`) : `${path}&lang=${lang}`;
      await page.goto(url);
      const shortcuts = page.locator('main nav a[href^="#"]');
      await expect(shortcuts).toHaveCount(count);
      for (const link of await shortcuts.all()) {
        const target = await link.getAttribute('href');
        await expect(page.locator(target!)).toHaveCount(1);
        expect(await link.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(40);
      }
      if (path === personal) await expect(page.getByTestId('personality-deep-dive')).toHaveAttribute('open');
    }
  }
});

test('mobile explorer filters are readable, resettable, and do not trigger small-input zoom', async ({ page }) => {
  for (const [lang, reset] of [['ko', '필터 초기화'], ['en', 'Reset filters'], ['ja', 'フィルターをリセット']] as const) {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/?view=genre-explorer&lang=${lang}`);
    const search = page.locator('main input');
    await expect(page.locator('button.result-card')).toHaveCount(34);
    for (const control of await page.locator('main input, main select').all()) {
      const metrics = await control.evaluate(element => ({ font: Number.parseFloat(getComputedStyle(element).fontSize), height: element.getBoundingClientRect().height }));
      expect(metrics.font).toBeGreaterThanOrEqual(16);
      expect(metrics.height).toBeGreaterThanOrEqual(44);
    }
    await search.fill('no-music-match-9834');
    await expect(page.locator('button.result-card')).toHaveCount(0);
    await page.getByRole('button', { name: reset, exact: true }).first().click();
    await expect(search).toHaveValue('');
    await expect(page.locator('button.result-card')).toHaveCount(34);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('mobile feedback fields and bottom share sheet remain accessible in narrow viewports', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${personal}&lang=ja`);
  const feedback = page.getByTestId('result-feedback');
  await feedback.locator('summary').first().click();
  for (const field of await feedback.locator('select, textarea').all()) expect(await field.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  const menu = await openShareMenu(page);
  const box = await menu.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(568);
  expect(await menu.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
});

test('quiz numerals and language controls keep their intended typography instead of inheriting body size', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?lang=ko');
  const languageButton = page.getByRole('button', { name: '한국어로 보기' });
  expect(await languageButton.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBe(11);
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  const answer = page.getByRole('radio').first();
  await expect(answer).toBeVisible();
  expect(await answer.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBe(30);
  await page.setViewportSize({ width: 320, height: 568 });
  expect(await answer.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBe(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
