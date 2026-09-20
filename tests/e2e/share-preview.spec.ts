import { expect, test } from '@playwright/test';

const hostToken = 'v1.82.46.74.31.68';
const guestToken = 'v1.70.61.79.48.75';

test('the Cloudflare share route exposes dynamic social metadata', async ({ request }) => {
  const response = await request.get(`/share?host=${hostToken}&guest=${guestToken}`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('우리 음악 궁합은 89%');
  expect(html).toContain('property="og:image"');
  expect(html).toContain(`/api/og?host=${hostToken}&amp;guest=${guestToken}`);
  expect(html).toContain(`/#compare=${hostToken}&amp;guest=${guestToken}`);
});

test('the dynamic Open Graph endpoint returns a 1200x630 PNG', async ({ request }) => {
  const response = await request.get(`/api/og?host=${hostToken}&guest=${guestToken}`);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toBe('image/png');
  const image = Buffer.from(await response.body());
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);
  expect(image.length).toBeGreaterThan(700_000);
});

test('a visitor opening the share URL is redirected into the app result', async ({ page }) => {
  await page.goto(`/share?host=${hostToken}&guest=${guestToken}`);
  await expect(page).toHaveURL(new RegExp(`#compare=${hostToken}&guest=${guestToken}$`));
  await expect(page.getByRole('heading', { level: 1, name: '거의 같은 플레이리스트' })).toBeVisible();
});
