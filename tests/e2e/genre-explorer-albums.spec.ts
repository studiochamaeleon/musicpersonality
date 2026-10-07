import { expect, test } from '@playwright/test';

for (const lang of ['ko', 'en', 'ja']) {
  test(`expanded album gateways are searchable and readable at 320px in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`/?view=genre-explorer&lang=${lang}`);
    const search = page.locator('.genre-explorer input');
    await search.fill('Radiohead');
    await expect(page.locator('button.result-card')).toHaveCount(1);
    await page.locator('button.result-card').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('article')).toHaveCount(6);
    await expect(dialog.locator('article a')).toHaveCount(6);
    await expect(dialog.locator('article').filter({ hasText: 'In Rainbows' })).toHaveCount(1);
    for (const link of await dialog.locator('article a').all()) {
      await expect(link).toHaveAttribute('href', /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    const overflow = await dialog.locator('article').evaluateAll(cards => cards.filter(card => card.scrollWidth > card.clientWidth + 1).length);
    expect(overflow).toBe(0);
    await dialog.locator('article a').last().scrollIntoViewIfNeeded();
    await expect(dialog.locator('article a').last()).toBeVisible();
    await page.keyboard.press('Escape');
    await search.fill('In Rainbows');
    await expect(page.locator('button.result-card')).toHaveCount(1);
    await page.locator('button.result-card').click();
    await expect(page.getByRole('dialog').locator('article').filter({ hasText: 'In Rainbows' })).toHaveCount(1);
  });
}

test('all 34 genre detail dialogs expose six unique album gateways', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?view=genre-explorer&lang=en');
  const cards = page.locator('button.result-card');
  await expect(cards).toHaveCount(34);
  for (let index = 0; index < 34; index++) {
    await cards.nth(index).click();
    const dialog = page.getByRole('dialog');
    const articles = dialog.locator('article');
    await expect(articles).toHaveCount(6);
    const titles = await articles.locator('h4').allTextContents();
    expect(new Set(titles).size).toBe(6);
    const links = await articles.locator('a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    expect(new Set(links).size).toBe(6);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('J-pop scene keeps six gateways and retains its matching artist', async ({ page }) => {
  await page.goto('/?view=genre-explorer&lang=en');
  await page.getByRole('button', { name: /J-POP/ }).click();
  await page.locator('.genre-explorer input').fill('YOASOBI');
  await page.locator('button.result-card').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('article')).toHaveCount(6);
  await expect(dialog.getByRole('heading', { name: 'YOASOBI', exact: true })).toBeVisible();
});
