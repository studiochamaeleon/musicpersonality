import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

type Scores = { mellow: number; unpretentious: number; sophisticated: number; intense: number; contemporary: number };
const genres = JSON.parse(readFileSync('src/data/genres.json', 'utf8')) as { id: string; personalityProfile: Scores }[];
const classical = genres.find(genre => genre.id === 'classical_romantic')!.personalityProfile;
const encoded = `v1.${classical.mellow}.${classical.unpretentious}.${classical.sophisticated}.${classical.intense}.${classical.contemporary}`;
const personalUrl = (language: string) => `/?v=3&m=${classical.mellow}&u=${classical.unpretentious}&s=${classical.sophisticated}&i=${classical.intense}&c=${classical.contemporary}&lang=${language}`;

for (const [language, compare, intensity, yours, genreLabel, creditLabel, rotate] of [
  ['ko', '다섯 축 직접 비교하기', '강렬함', '나', '장르', '녹음 크레딧', '다른 곡으로 듣기'],
  ['en', 'Explore all five dimensions', 'Passionate', 'You', 'Genre', 'Recording credits', 'Try another track'],
  ['ja', '五つの軸を比較する', '力強さ', 'あなた', 'ジャンル', '録音クレジット', '別の曲を試す'],
] as const) {
  test(`${language}: result navigation and taste comparisons are touch-sized and screen-reader readable`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(personalUrl(language));
    await expect(page.locator('main nav a')).toHaveCount(4);
    for (const link of await page.locator('main nav a').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const summary = page.locator('summary').filter({ hasText: compare });
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await summary.click();
    const choose = page.getByRole('button', { name: intensity, exact: true });
    await choose.focus();
    await choose.press('Enter');
    await expect(choose).toBeFocused();
    await expect(choose).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('meter', { name: `${yours} · ${intensity}`, exact: true })).toHaveAttribute('aria-valuenow', String(classical.intense));
    await expect(page.getByRole('meter', { name: `${genreLabel} · ${intensity}`, exact: true })).toHaveAttribute('aria-valuenow', String(classical.intense));
    await expect(page.locator('#music-character').getByRole('meter')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`${language}: pair picks retain recording credits and describe keyboard track changes`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(`/?lang=${language}#compare=${encoded}&guest=${encoded}`);
    const initialUrl = page.url();
    const card = page.getByTestId('pair-track-host');
    await expect(card.getByTestId('pair-recording-credit')).toContainText(`${creditLabel}: Sergei Rachmaninoff`);
    await expect(card.getByTestId('pair-recording-credit')).toContainText('Los Angeles Philharmonic · Gustavo Dudamel');
    for (const link of await page.locator('main nav a').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const previous = await card.getByRole('heading').textContent();
    const button = card.getByRole('button', { name: rotate, exact: true });
    await expect(button).toHaveAttribute('aria-describedby', 'pair-track-title-host pair-track-change-note');
    await button.focus();
    await button.press('Enter');
    await expect(card.getByRole('heading')).not.toHaveText(previous || '');
    await expect(button).toBeFocused();
    const title = await card.getByRole('heading').textContent();
    await expect(page.getByTestId('pair-track-status')).toContainText(title || '');
    await expect(page.getByTestId('pair-track-status')).toHaveAttribute('aria-atomic', 'true');
    expect(page.url()).toBe(initialUrl);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('feedback copying is single-flight and does not report a newly edited draft as copied', async ({ page }) => {
  await page.addInitScript(() => {
    type FeedbackCopyWindow = Window & { __feedbackCopies?: string[]; __finishFeedbackCopy?: () => void };
    const capture = window as FeedbackCopyWindow;
    capture.__feedbackCopies = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: (report: string) => {
        capture.__feedbackCopies!.push(report);
        return new Promise<void>(resolve => { capture.__finishFeedbackCopy = resolve; });
      },
    } });
  });
  await page.goto(personalUrl('en'));
  const feedback = page.getByTestId('result-feedback');
  await feedback.locator('summary').first().click();
  await feedback.getByRole('combobox').first().selectOption('fits');
  await feedback.getByRole('textbox').fill('First draft');
  await feedback.getByRole('button', { name: 'Copy feedback', exact: true }).click();
  const pending = feedback.getByRole('button', { name: 'Copying…', exact: true });
  await expect(pending).toBeDisabled();
  await expect(pending).toHaveAttribute('aria-busy', 'true');
  await pending.dispatchEvent('click');
  await feedback.getByRole('textbox').fill('Updated draft');
  await page.evaluate(() => (window as Window & { __finishFeedbackCopy?: () => void }).__finishFeedbackCopy?.());
  await expect(feedback.getByRole('button', { name: 'Copy feedback', exact: true })).toBeEnabled();
  await expect(feedback.getByRole('status')).toBeEmpty();
  expect(await page.evaluate(() => (window as Window & { __feedbackCopies?: string[] }).__feedbackCopies?.length)).toBe(1);
  await feedback.getByRole('button', { name: 'Copy feedback', exact: true }).click();
  await page.evaluate(() => (window as Window & { __finishFeedbackCopy?: () => void }).__finishFeedbackCopy?.());
  await expect(feedback.getByRole('status')).toContainText('Copied.');
  const reports = await page.evaluate(() => (window as Window & { __feedbackCopies?: string[] }).__feedbackCopies!);
  expect(reports[0]).toContain('First draft');
  expect(reports[1]).toContain('Updated draft');
});
