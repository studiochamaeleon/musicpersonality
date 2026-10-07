import { expect, test as base, type Page } from '@playwright/test';
import { createOriginOutage } from './helpers/originOutage';

// Playwright 1.63 WebKit's setOffline rejects even literal service-worker Responses:
// https://github.com/microsoft/playwright/issues/42775
// Close a per-test origin instead, proving genuine network-failure fallback on both engines.
// This is not a claim that mobile WebKit emulation proves physical Safari airplane-mode behavior.
const test = base.extend<{ originOutage: Awaited<ReturnType<typeof createOriginOutage>> }>({
  originOutage: async ({ baseURL }, runFixture) => {
    if (!baseURL) throw new Error('A local preview baseURL is required for PWA outage tests.');
    const originOutage = await createOriginOutage(baseURL);
    try { await runFixture(originOutage); }
    finally { await originOutage.stop(); }
  },
});

test.use({ locale: 'ko-KR' });

async function expectPreparedHome(page: Page) {
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 30_000 }).toBe(true);
  await expect.poll(() => page.evaluate(async () => Boolean(await (await caches.open('muti-home-v2')).match(new URL('/', location.origin).href))), { timeout: 30_000 }).toBe(true);
}

async function expectVisitedChunksCached(page: Page) {
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('muti-assets-v2');
    const urls = performance.getEntriesByType('resource').map(entry => new URL(entry.name)).filter(url =>
      url.origin === location.origin && url.pathname.startsWith('/_next/static/') && /(?:^|[.-])[a-f\d]{8,}(?:[.-]|$)/i.test(url.pathname.split('/').pop() || ''));
    const cached = await Promise.all(urls.map(url => cache.match(url.href)));
    return cached.filter(response => !response).length;
  }), { timeout: 30_000 }).toBe(0);
}

test('after an online revisit, the prepared home and visited quiz survive an unreachable origin', async ({ page, originOutage }) => {
  await page.goto(originOutage.origin);
  await expectPreparedHome(page);
  // The second navigation is controlled, so the application's lazy data imports can also be retained.
  await page.reload();
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다', exact: true })).toBeVisible();
  await expectVisitedChunksCached(page);
  await page.goto(originOutage.origin);
  await expect(page.getByRole('button', { name: '내 음악 성격 찾기', exact: true })).toBeEnabled();
  await expectVisitedChunksCached(page);
  await originOutage.stop();
  expect(originOutage.isListening()).toBe(false);
  const fallbackResponse = await page.reload();
  expect(fallbackResponse!.status()).toBe(200);
  expect(fallbackResponse!.fromServiceWorker()).toBe(true);
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다', exact: true })).toBeVisible();
});

test('online HTML replaces a previously cached home and the refreshed snapshot survives an unreachable origin', async ({ page, originOutage }) => {
  await page.goto(originOutage.origin);
  await expectPreparedHome(page);
  const marker = 'previous-offline-shell-test-marker';
  await page.evaluate(async marker => {
    const cache = await caches.open('muti-home-v2');
    const response = await cache.match(new URL('/', location.origin).href);
    await cache.put(new URL('/', location.origin).href, new Response(`${await response!.text()}<!--${marker}-->`, { headers: { 'Content-Type': 'text/html' } }));
  }, marker);
  const onlineResponse = await page.reload();
  expect(await onlineResponse!.text()).not.toContain(marker);
  await expect(page.getByRole('button', { name: '내 음악 성격 찾기', exact: true })).toBeEnabled();
  await expect.poll(() => page.evaluate(async marker => {
    const response = await (await caches.open('muti-home-v2')).match(new URL('/', location.origin).href);
    return (await response!.text()).includes(marker);
  }, marker), { timeout: 30_000 }).toBe(false);
  await expectVisitedChunksCached(page);
  await originOutage.stop();
  expect(originOutage.isListening()).toBe(false);
  const fallbackResponse = await page.reload();
  expect(fallbackResponse!.status()).toBe(200);
  expect(fallbackResponse!.fromServiceWorker()).toBe(true);
  expect(await fallbackResponse!.text()).not.toContain(marker);
  await expect(page.getByRole('button', { name: '내 음악 성격 찾기', exact: true })).toBeEnabled();
});

test('an unreachable isolated origin actually fails without a service worker', async ({ browser, originOutage }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
    const page = await context.newPage();
    await page.goto(originOutage.origin);
    await originOutage.stop();
    expect(originOutage.isListening()).toBe(false);
    // A new, uncached URL is the negative control for the outage, not an HTTP-cache hit.
    await expect(page.goto(`${originOutage.origin}/?uncached-outage-control=1`, { timeout: 10_000 })).rejects.toThrow();
  } finally { await context.close(); }
});

test('RSC, score URLs, dynamic previews, APIs, and legal documents do not enter service-worker caches', async ({ page }) => {
  await page.goto('/');
  await expectPreparedHome(page);
  const marker = 'canonical-home-must-survive-rsc';
  await page.evaluate(async marker => {
    const cache = await caches.open('muti-home-v2');
    const response = await cache.match(new URL('/', location.origin).href);
    await cache.put(new URL('/', location.origin).href, new Response(`${await response!.text()}<!--${marker}-->`, { headers: { 'Content-Type': 'text/html' } }));
    await Promise.allSettled([
      fetch('/', { headers: { RSC: '1', Accept: 'text/x-component' } }),
      fetch('/?_rsc=worker-exclusion-test'),
      fetch('/?v=3&m=95&u=40&s=70&i=20&c=60'),
      fetch('/result/?v=3&m=95&u=40&s=70&i=20&c=60'),
      fetch('/share/?v=3&m=95&u=40&s=70&i=20&c=60'),
      fetch('/api/og?m=95&u=40&s=70&i=20&c=60'),
      fetch('/privacy/'), fetch('/terms/'),
    ]);
  }, marker);
  const stored = await page.evaluate(async () => {
    const home = await caches.open('muti-home-v2');
    const response = await home.match(new URL('/', location.origin).href);
    const homeKeys = (await home.keys()).map(request => request.url);
    const assetKeys = (await (await caches.open('muti-assets-v2')).keys()).map(request => request.url);
    return { html: await response!.text(), homeKeys, assetKeys, origin: location.origin };
  });
  expect(stored.html).toContain(marker);
  expect(stored.homeKeys).toEqual([`${stored.origin}/`]);
  for (const key of [...stored.homeKeys, ...stored.assetKeys]) {
    const url = new URL(key);
    expect(url.search).toBe('');
    expect(url.pathname).not.toMatch(/^\/(?:result|share|api|privacy|terms)(?:\/|$)/);
  }
});
