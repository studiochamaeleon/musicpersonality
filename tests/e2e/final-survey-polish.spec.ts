import { expect, test } from '@playwright/test';

const draftKey = 'music-personality-survey';

for (const [language, firstQuestion, secondQuestion, thirdQuestion, previous] of [
  ['ko', '나는 조용하고 차분한 음악을 선호한다', '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다', '스트레스가 많을 때 부드러운 음악을 찾는다', '이전'],
  ['en', 'I prefer quiet and calm music', 'I like to meditate or relax while listening to music', "I seek soft music when I'm stressed", 'Previous'],
  ['ja', '静かで穏やかな音楽が好きだ', '音楽を聴きながら瞑想したり、くつろいだりするのが好きだ', 'ストレスを感じると、やさしい音楽を聴きたくなる', '前へ'],
] as const) {
  test(`${language} keyboard radio exploration stays on the question until confirmed and fits narrow mobile screens`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/?view=survey&lang=${language}`);
    const firstHeading = page.getByRole('heading', { level: 1, name: firstQuestion });
    const group = page.getByRole('radiogroup', { name: firstQuestion, exact: true });
    await expect(firstHeading).toBeFocused();
    await expect(group).toHaveAccessibleDescription(/Enter/);
    await group.getByRole('radio', { name: /^1:/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('radio', { name: /^2:/ })).toBeFocused();
    await expect(group.getByRole('radio', { name: /^2:/ })).toHaveAttribute('aria-checked', 'true');
    await page.waitForTimeout(800); // Beyond the click/number auto-advance delay.
    await expect(firstHeading).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await expect(group.getByRole('radio', { name: /^5:/ })).toBeFocused();
    await expect(group.getByRole('radio', { name: /^5:/ })).toHaveAttribute('aria-checked', 'true');
    await page.waitForTimeout(800);
    await expect(firstHeading).toBeVisible();
    await page.keyboard.press('Enter');
    const secondHeading = page.getByRole('heading', { level: 1, name: secondQuestion });
    await expect(secondHeading).toBeFocused();
    await expect(page.getByRole('radiogroup', { name: secondQuestion, exact: true })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuetext', /40/);

    const layout = await page.getByRole('radiogroup').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        left: rect.left,
        right: rect.right,
        viewport: innerWidth,
        sizes: [...element.querySelectorAll('button')].map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })),
      };
    });
    expect(layout.pageOverflow).toBeLessThanOrEqual(1);
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeLessThanOrEqual(layout.viewport);
    for (const size of layout.sizes) {
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }

    await page.keyboard.press('3');
    await expect(page.getByRole('heading', { level: 1, name: thirdQuestion })).toBeFocused();
    await page.getByRole('button', { name: previous, exact: true }).click();
    await expect(secondHeading).toBeFocused();
    await expect(page.getByRole('radio', { name: /^3:/ })).toHaveAttribute('aria-checked', 'true');
  });
}

test('arrow exploration cancels a pending click advance and Next confirms only the current answer', async ({ page }) => {
  await page.goto('/?view=survey&lang=ko');
  const firstHeading = page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' });
  await expect(firstHeading).toBeVisible();
  await page.getByRole('radio', { name: /^4:/ }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /^5:/ })).toHaveAttribute('aria-checked', 'true');
  await page.waitForTimeout(800);
  await expect(firstHeading).toBeVisible();
  await page.getByRole('button', { name: '다음', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeFocused();
  await page.waitForTimeout(800);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}').answers, draftKey)).toEqual({ mellow_1: 5 });
});

test('a keyboard-selected answer survives refresh and Space confirms it without losing the selection', async ({ page }) => {
  await page.goto('/?view=survey&lang=en');
  await page.getByRole('radio', { name: /^1:/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /^2:/ })).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'I prefer quiet and calm music' })).toBeFocused();
  const selected = page.getByRole('radio', { name: /^2:/ });
  await expect(selected).toHaveAttribute('aria-checked', 'true');
  await selected.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { level: 1, name: 'I like to meditate or relax while listening to music' })).toBeFocused();
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}').answers, draftKey)).toEqual({ mellow_1: 2 });
});

test('modified arrow shortcuts do not change a survey answer', async ({ page }) => {
  await page.goto('/?view=survey');
  const firstRadio = page.getByRole('radio', { name: /^1:/ });
  await firstRadio.focus();
  await firstRadio.evaluate(button => {
    for (const modifier of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }]) {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, ...modifier }));
    }
  });
  await expect(firstRadio).toBeFocused();
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
});
