import { expect, test } from '@playwright/test';

test('a malformed saved step recovers valid answers and permits correcting them', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('music-personality-survey', JSON.stringify({
    currentStep: 2.5,
    questionVersion: 3,
    answers: { mellow_1: 4, mellow_2: 3, mellow_3: '4' },
    startTime: 'invalid-date',
    isComplete: false,
  })));
  await page.goto('/?view=survey');
  await expect(page.getByRole('heading', { level: 1, name: '스트레스가 많을 때 부드러운 음악을 찾는다' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5');
  await page.getByRole('button', { name: '이전', exact: true }).click();
  await expect(page.getByRole('radio', { name: '3: 보통이다' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: '4: 그렇다' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '스트레스가 많을 때 부드러운 음악을 찾는다' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem('music-personality-survey') || '{}'));
  expect(saved.currentStep).toBe(3);
  expect(saved.answers.mellow_1).toBe(4);
  expect(saved.answers.mellow_2).toBe(4);
  expect(Number.isFinite(Date.parse(saved.startTime))).toBe(true);
});

test('browser shortcuts, composing and repeated keys do not submit an answer', async ({ page }) => {
  await page.goto('/?view=survey');
  const firstQuestion = page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' });
  await expect(firstQuestion).toBeVisible();
  await page.evaluate(() => {
    for (const option of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true }, { isComposing: true }]) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true, ...option }));
    }
  });
  await page.waitForTimeout(700);
  await expect(firstQuestion).toBeVisible();
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
  await page.keyboard.press('3');
  await expect(firstQuestion).toBeHidden();
  await page.getByRole('button', { name: '이전', exact: true }).click();
  await expect(page.getByRole('radio', { name: '3: 보통이다' })).toHaveAttribute('aria-checked', 'true');
});
