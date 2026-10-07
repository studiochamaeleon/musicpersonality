import { expect, type Page } from '@playwright/test';

export async function openShareMenu(page: Page) {
  const menu = page.locator('dialog[open][data-testid$="-share-menu"]');
  if (await menu.count()) return menu;
  await page.locator('[data-testid$="-share-trigger"]').click();
  await expect(menu).toBeVisible();
  return menu;
}
