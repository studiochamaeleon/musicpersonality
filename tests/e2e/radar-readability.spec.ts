import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });

for (const language of ['ko', 'en', 'ja']) {
  test(`${language} narrow result and genre charts show complete labels, values, and static scores`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    for (const explorer of [false, true]) {
      await page.goto(explorer ? `/?view=genre-explorer&lang=${language}` : `/?v=3&m=70&u=61&s=79&i=48&c=75&lang=${language}`);
      if (explorer) await page.locator('button.result-card').first().click();
      const scope = explorer ? page.getByRole('dialog') : page.locator('#spectrum');
      const chart = scope.getByTestId('music-radar-chart');
      await expect(chart).toBeVisible();
      // The container can be visible before ResponsiveContainer has measured
      // it and mounted its SVG ticks. Wait for the actual chart, not its shell.
      const ticks = chart.locator('.recharts-polar-angle-axis-tick text');
      await expect(ticks).toHaveCount(5);
      // Compact sizing can replace the first SVG after its ResizeObserver
      // callback. Read count and bounds together in a retryable assertion.
      await expect.poll(() => ticks.evaluateAll(nodes => ({
        count: nodes.length,
        clipped: nodes.filter(node => {
          const bounds = node.closest('svg')!.getBoundingClientRect();
          const label = node.getBoundingClientRect();
          return label.left < bounds.left - 1 || label.right > bounds.right + 1;
        }).length,
      }))).toEqual({ count: 5, clipped: 0 });
      const legend = chart.getByTestId('music-radar-legend');
      await expect(legend.locator(':scope > div')).toHaveCount(5);
      for (const item of await legend.locator(':scope > div').all()) {
        expect(await item.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        expect(await item.locator('div').nth(1).evaluate(node => getComputedStyle(node).textOverflow)).not.toBe('ellipsis');
      }
      const shape = chart.locator('.recharts-radar-polygon');
      await expect(shape).toHaveCount(1);
      await expect.poll(async () => {
        const bounds = await shape.boundingBox();
        return Boolean(bounds && bounds.width > 20 && bounds.height > 20);
      }).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  });
}
