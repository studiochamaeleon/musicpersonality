import { expect, test } from '@playwright/test';
import { interpretResult, resultInterpretationCopy } from '../../src/lib/resultInterpretation';
import genres from '../../src/data/genres.json';
import { rankResultGenres } from '../../src/lib/resultRanking';

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });
const cases = [
  { scores: [0, 0, 0, 0, 0], kind: 'explore' },
  { scores: [25, 25, 25, 25, 25], kind: 'even' },
  { scores: [50, 50, 50, 50, 50], kind: 'neutral' },
  { scores: [100, 100, 100, 100, 100], kind: 'broad' },
  { scores: [70, 61, 79, 48, 75], kind: 'nearby' },
  { scores: [80, 50, 85, 30, 75], kind: 'clear' },
] as const;
for (const lang of ['ko', 'en', 'ja'] as const) {
  test(`${lang} keeps framing, genre, score and social previews consistent at 320px`, async ({ page, request }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const { scores, kind } of cases) {
      const profile = { mellow: scores[0], unpretentious: scores[1], sophisticated: scores[2], intense: scores[3], contemporary: scores[4] };
      expect(interpretResult(profile, genres, 3).kind).toBe(kind);
      const ranked = rankResultGenres(profile, genres, 3);
      const copy = resultInterpretationCopy(kind, lang);
      const token = 'v1.' + scores.join('.');
      await page.goto(`/?v=3&m=${scores[0]}&u=${scores[1]}&s=${scores[2]}&i=${scores[3]}&c=${scores[4]}&lang=${lang}`);
      await expect(page.locator('main h1')).toBeVisible();
      if (kind === 'clear') {
        await expect(page.getByTestId('result-interpretation')).toHaveCount(0);
        await expect(page.getByTestId('card-interpretation')).toHaveCount(0);
      } else {
        await expect(page.getByTestId('result-interpretation')).toHaveAttribute('data-kind', kind);
        await expect(page.getByTestId('result-interpretation')).toHaveText(copy.note);
        await expect(page.getByTestId('card-interpretation')).toHaveAttribute('data-kind', kind);
        await expect(page.getByTestId('card-interpretation')).toContainText(copy.cardNote);
      }
      const card = page.locator('.shareable-card-container > div').first();
      await card.scrollIntoViewIfNeeded();
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      // No clipped warning or footer inside the exportable image.
      const footer = await card.locator('footer').boundingBox();
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(box!.y + box!.height + 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const response = await request.get(`/result?score=${token}&sv=3&lang=${lang}`);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      expect(html).toMatch(new RegExp(String(ranked[0].match.compatibility) + '[%％]'));
      if (kind !== 'clear') {
        expect(html).toContain(copy.badge);
        expect(html).toContain(copy.note);
      }
      expect(html).toContain('ogv=3');
      const image = await request.get(`/api/og?score=${token}&sv=3&lang=${lang}&ogv=3`);
      expect(image.ok()).toBe(true);
      const png = Buffer.from(await image.body());
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
      if (kind === 'neutral') await card.screenshot({ path: `test-results/interpretation-neutral-${lang}.png` });
    }
  });
}
