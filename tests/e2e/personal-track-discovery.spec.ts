import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const catalog = JSON.parse(readFileSync('src/data/musicCatalog.json', 'utf8'));
const genres = JSON.parse(readFileSync('src/data/genres.json', 'utf8'));
type Genre = { id: string; personalityProfile: { mellow: number; unpretentious: number; sophisticated: number; intense: number; contemporary: number } };
type Artist = { name: string; role: string; genreIds?: string[]; track: { title: string; spotifyUrl: string; year: number } };
function resultUrl(genreId: string, language = 'en') {
  const genre = genres.find((item: Genre) => item.id === genreId) as Genre;
  const profile = genre.personalityProfile;
  return `/?v=3&m=${profile.mellow}&u=${profile.unpretentious}&s=${profile.sophisticated}&i=${profile.intense}&c=${profile.contemporary}&lang=${language}`;
}

for (const [language, buttonName, note] of [
  ['ko', '다른 장면의 곡', '검사 결과와 각 장르의 유사도는 바뀌지 않아요'],
  ['en', 'Another scene to try', 'does not change your result or the similarity score for each genre'],
  ['ja', '別のシーンの曲', 'テスト結果と各ジャンルの一致度は変わりません'],
] as const) {
  test(`${language}: bounded track controls preserve result, keyboard focus, feedback, and mobile layout`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(resultUrl('pop_synthpop', language));
    const picks = page.locator('#track-picks [data-track-role]');
    await expect(picks).not.toHaveCount(0);
    expect(await picks.count()).toBeLessThanOrEqual(6);
    const initialUrls = await picks.locator('a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    const initialHeading = await page.getByRole('heading', { level: 1 }).textContent();
    const initialUrl = page.url();
    const anchorUrl = await page.locator('#track-picks [data-track-role="anchor"] a').getAttribute('href');
    await expect(page.locator('#track-picks [data-track-role="anchor"] button')).toHaveCount(0);
    await expect(page.locator('#personal-track-change-note')).toContainText(note);

    const bridge = page.locator('#track-picks [data-track-role="bridge"]');
    const button = bridge.getByRole('button', { name: buttonName, exact: true });
    const previous = await bridge.getByRole('heading').textContent();
    await button.focus();
    await button.press('Enter');
    await expect(bridge.getByRole('heading')).not.toHaveText(previous || '');
    await expect(button).toBeFocused();
    expect(page.url()).toBe(initialUrl);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(initialHeading || '');
    await expect(page.locator('#track-picks [data-track-role="anchor"] a')).toHaveAttribute('href', anchorUrl || '');
    const title = await bridge.getByRole('heading').textContent();
    await expect(page.getByTestId('personal-track-status')).toContainText(title || '');
    const urls = await picks.locator('a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    expect(new Set(urls).size).toBe(urls.length);
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const feedback = page.getByTestId('result-feedback');
    await feedback.locator('summary').first().click();
    await feedback.getByRole('combobox').first().selectOption('fits');
    await feedback.getByTestId('feedback-preview-panel').locator('summary').click();
    await expect(feedback.getByTestId('feedback-preview')).toContainText(title || '');
    if (title !== previous) await expect(feedback.getByTestId('feedback-preview')).not.toContainText(previous || '__missing__');

    await page.reload();
    await expect(page.locator('#track-picks [data-track-role]')).toHaveCount(initialUrls.length);
    expect(await picks.locator('a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))).toEqual(initialUrls);
  });
}

test('every curated crossover artist can be reached from a matching personal result', async ({ page }) => {
  for (const artist of catalog.crossovers as Artist[]) {
    await page.goto(resultUrl(artist.genreIds![0]));
    const bridge = page.locator('#track-picks [data-track-role="bridge"]');
    await expect(bridge).toBeVisible();
    const seen = new Set<string>();
    for (let round = 0; round <= catalog.crossovers.length; round++) {
      seen.add(await bridge.getByRole('link').getAttribute('href') || '');
      if (seen.has(artist.track.spotifyUrl)) break;
      const button = bridge.getByRole('button', { name: 'Another scene to try', exact: true });
      await expect(button).toBeVisible();
      await button.click();
    }
    expect(seen.has(artist.track.spotifyUrl), artist.name + ' is shadowed by catalog order').toBe(true);
    expect(new Set(await page.locator('#track-picks [data-track-role] a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))).size)
      .toBe(await page.locator('#track-picks [data-track-role]').count());
  }
});

test('an added discovery is selectable while the cornerstone and the slot count stay fixed', async ({ page }) => {
  const genre = genres.find((item: Genre) => (catalog.genres[item.id] as Artist[]).filter(artist => artist.role === 'discovery').length > 1) as Genre | undefined;
  expect(genre, 'catalog must include an expanded discovery rather than only old fixed pairs').toBeDefined();
  const discoveries = (catalog.genres[genre!.id] as Artist[]).filter(artist => artist.role === 'discovery');
  await page.goto(resultUrl(genre!.id));
  const picks = page.locator('#track-picks [data-track-role]');
  const count = await picks.count();
  const anchor = page.locator('#track-picks [data-track-role="anchor"] a');
  const anchorUrl = await anchor.getAttribute('href');
  const firstDiscovery = page.locator('#track-picks [data-track-role="discovery"]').first();
  const button = firstDiscovery.getByRole('button', { name: 'Another track in this genre', exact: true });
  const seen = new Set<string>();
  for (let round = 0; round < discoveries.length; round++) {
    seen.add(await firstDiscovery.getByRole('link').getAttribute('href') || '');
    await button.click();
    await expect(picks).toHaveCount(count);
    await expect(anchor).toHaveAttribute('href', anchorUrl || '');
  }
  for (const artist of discoveries) expect(seen.has(artist.track.spotifyUrl), 'unreachable discovery ' + artist.name).toBe(true);
});

test('classical discovery identifies the modern performer and recording credits in every language', async ({ page }) => {
  const performance = (catalog.genres.classical_romantic as Artist[]).find(artist => artist.name === 'Yuja Wang')!;
  expect(performance).toBeDefined();
  await page.setViewportSize({ width: 320, height: 812 });
  for (const [language, name, creditLabel] of [['ko', '유자 왕', '녹음 크레딧'], ['en', 'Yuja Wang', 'Recording credits'], ['ja', 'Yuja Wang', '録音クレジット']]) {
    await page.goto(resultUrl('classical_romantic', language));
    const card = page.locator('#track-picks [data-track-role="discovery"]').filter({ has: page.locator(`a[href="${performance.track.spotifyUrl}"]`) });
    await expect(card.getByText(name, { exact: true }).first()).toBeVisible();
    const credit = card.getByTestId('personal-recording-credit');
    await expect(credit).toContainText(creditLabel + ': Sergei Rachmaninoff');
    await expect(credit).toContainText('Los Angeles Philharmonic · Gustavo Dudamel');
    await expect(card.getByRole('link')).toHaveAttribute('href', performance.track.spotifyUrl);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
