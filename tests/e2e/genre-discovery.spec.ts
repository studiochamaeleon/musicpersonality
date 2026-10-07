import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const catalog = JSON.parse(readFileSync('src/data/musicCatalog.json', 'utf8'));
const weeknd = catalog.crossovers.find((artist: { name: string }) => artist.name === 'The Weeknd');

test('genre search finds original names and familiar artists across all three UI languages', async ({ page }) => {
  for (const lang of ['ko', 'en', 'ja']) {
    await page.goto(`/?view=genre-explorer&lang=${lang}`);
    const search = page.locator('.genre-explorer input');
    await search.fill(' Ｋ ＰＯＰ ');
    await expect(page.locator('button.result-card')).not.toHaveCount(0);
    await search.fill('New Jeans');
    await expect(page.locator('button.result-card')).toHaveCount(2);
    await search.fill('뉴진스');
    await expect(page.locator('button.result-card')).toHaveCount(2);
    await search.fill('Nujabes');
    await expect(page.locator('button.result-card')).toHaveCount(1);
    await search.fill('___');
    await expect(page.locator('button.result-card')).toHaveCount(0);
  }
});

test('artist search still respects the selected genre category and resets without leaving an invisible constraint', async ({ page }) => {
  await page.goto('/?view=genre-explorer&lang=ko');
  const search = page.locator('.genre-explorer input');
  const category = page.getByRole('combobox', { name: '전체 장르', exact: true });
  await search.fill('NewJeans');
  await category.selectOption('JAZZ');
  await expect(page.locator('button.result-card')).toHaveCount(0);
  await category.selectOption('POP');
  await expect(page.locator('button.result-card')).toHaveCount(2);
  await page.getByRole('button', { name: /J-POP · 일본 음악/ }).click();
  await expect(category).toHaveValue('all');
  await expect(page.locator('button.result-card')).toHaveCount(0);
  await page.getByRole('button', { name: '필터 초기화', exact: true }).first().click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('button', { name: /J-POP · 일본 음악/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('button.result-card')).toHaveCount(34);
});

test('an artist found by search is included in genre details even when more than two crossover references exist', async ({ page }) => {
  await page.goto('/?view=genre-explorer&lang=en');
  const search = page.locator('.genre-explorer input');
  await search.fill('The Weeknd');
  await page.getByRole('button', { name: /Synthpop/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'The Weeknd', exact: true })).toBeVisible();
  const album = dialog.getByRole('link', { name: `The Weeknd · ${weeknd.album.title}: Listen to the album on Spotify`, exact: true });
  await expect(album).toHaveAttribute('href', weeknd.album.spotifyUrl);
  await expect(album).toHaveAttribute('target', '_blank');
  await expect(album).toHaveAttribute('rel', 'noopener noreferrer');
  await page.keyboard.press('Escape');
  await search.fill(weeknd.track.title);
  await page.getByRole('button', { name: /Synthpop/ }).first().click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'The Weeknd', exact: true })).toBeVisible();
});

test('genre details restore the actual clicked card when the browser does not focus pointer-clicked buttons', async ({ page }) => {
  await page.goto('/?view=genre-explorer&lang=ko');
  await page.locator('.genre-explorer input').focus();
  const card = page.getByRole('button', { name: /미니멀리즘/ }).first();
  await card.scrollIntoViewIfNeeded();
  await card.evaluate(element => element.addEventListener('mousedown', event => event.preventDefault(), { once: true }));
  const scrollBefore = await page.evaluate(() => scrollY);
  await card.click();
  const dialog = page.getByRole('dialog', { name: '미니멀리즘' });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: '닫기', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link').last()).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - scrollBefore)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  expect(Math.abs(await page.evaluate(() => scrollY) - scrollBefore)).toBeLessThanOrEqual(1);
});
