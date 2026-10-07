import { expect, test } from '@playwright/test';
import { openShareMenu } from './helpers/share-menu';

const hostToken = 'v1.82.46.74.31.68';
const guestToken = 'v1.70.61.79.48.75';
const personalDestination = '/?v=3&m=70&u=61&s=79&i=48&c=75&lang=ko';

test('pair share handoff preserves legacy result versions and rejects unsupported ones', async ({ request, page }) => {
  const response = await request.get(`/share?host=${hostToken}&guest=${guestToken}&hv=2&gv=2`);
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain(`/#compare=${hostToken}&amp;guest=${guestToken}&amp;hv=2&amp;gv=2`);
  expect((await request.get(`/share?host=${hostToken}&hv=99`)).status()).toBe(400);
  await page.goto(`/share?host=${hostToken}&guest=${guestToken}&hv=2&gv=2`);
  await expect(page).toHaveURL(/#compare=.+&hv=2&gv=2/);
  await page.getByRole('button', { name: '응답한 사람의 결과 보기' }).click();
  await expect(page).toHaveURL(/v=2&m=70/);
});

test('MUTI branding and canonical domain stay consistent across public metadata', async ({ request, page }) => {
  const homepage = await request.get('/');
  const html = await homepage.text();
  expect(html).toContain('<title>MUTI | 나와 닮은 음악 찾기</title>');
  expect(html).toContain('취향을 들으면,');
  expect(html).toContain('좋아하는 음악에 답하고');
  expect(html).toContain('rel="canonical" href="https://muti.chameleonstudio.xyz/"');
  expect(html).toContain('property="og:site_name" content="MUTI"');
  expect(html).toContain('https://muti.chameleonstudio.xyz/og-image.png');
  expect(await (await request.get('/robots.txt')).text()).toContain('https://muti.chameleonstudio.xyz/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://muti.chameleonstudio.xyz/privacy/');
  expect(sitemap).toContain('https://muti.chameleonstudio.xyz/terms/');
  expect(await (await request.get('/manifest.webmanifest')).json()).toMatchObject({ name: 'MUTI — Music Taste Identity', short_name: 'MUTI' });

  await page.goto('/');
  await expect(page).toHaveTitle('MUTI | 나와 닮은 음악 찾기');
  await expect(page.locator('header').first().getByText('MUTI', { exact: true })).toBeVisible();
});

test('legal pages expose their content and unique canonical metadata before hydration', async ({ request }) => {
  const privacy = await (await request.get('/privacy/')).text();
  const terms = await (await request.get('/terms/')).text();

  expect(privacy).toContain('<title>개인정보 보호정책 | MUTI</title>');
  expect(privacy).toContain('개인정보 보호정책</h1>');
  expect(privacy).toContain('rel="canonical" href="https://muti.chameleonstudio.xyz/privacy/"');
  expect(terms).toContain('<title>이용약관 | MUTI</title>');
  expect(terms).toContain('이용약관</h1>');
  expect(terms).toContain('rel="canonical" href="https://muti.chameleonstudio.xyz/terms/"');
});

test('the Cloudflare share route exposes dynamic social metadata', async ({ request }) => {
  const response = await request.get(`/share?host=${hostToken}&guest=${guestToken}`);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['x-robots-tag']).toBe('noindex, follow');
  const html = await response.text();
  expect(html).toContain('<meta name="robots" content="noindex,follow" />');
  expect(html).toContain('우리 음악 궁합은 89%');
  expect(html).toContain('property="og:image"');
  expect(html).toContain(`/api/og?host=${hostToken}&amp;guest=${guestToken}`);
  expect(html).toContain(`/#compare=${hostToken}&amp;guest=${guestToken}`);
});

test('English match shares preserve English metadata and the app language', async ({ request, page }) => {
  const response = await request.get(`/share?host=${hostToken}&guest=${guestToken}&lang=en`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('<html lang="en">');
  expect(html).toContain('Our music match is 89%');
  expect(html).toContain(`/api/og?host=${hostToken}&amp;guest=${guestToken}&amp;lang=en`);
  expect(html).toContain(`/?lang=en#compare=${hostToken}&amp;guest=${guestToken}`);

  await page.goto(`/share?host=${hostToken}&guest=${guestToken}&lang=en`);
  await expect(page).toHaveURL(/\?lang=en#compare=/);
  await expect(page.getByRole('heading', { level: 1, name: 'Almost the same playlist' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Almost the same playlist' })).toBeVisible();
});

test('Japanese match shares preserve Japanese metadata and the app language', async ({ request, page }) => {
  const response = await request.get(`/share?host=${hostToken}&guest=${guestToken}&lang=ja`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('<html lang="ja">');
  expect(html).toContain('二人の音楽相性は89％');
  expect(html).toContain('property="og:locale" content="ja_JP"');
  expect(html).toContain(`/api/og?host=${hostToken}&amp;guest=${guestToken}&amp;lang=ja`);
  expect(html).toContain(`/?lang=ja#compare=${hostToken}&amp;guest=${guestToken}`);

  await page.goto(`/share?host=${hostToken}&guest=${guestToken}&lang=ja`);
  await expect(page).toHaveURL(/\?lang=ja#compare=/);
  await expect(page.getByRole('heading', { level: 1, name: 'ほぼ同じプレイリスト' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'ほぼ同じプレイリスト' })).toBeVisible();
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

test('a personal result share exposes result-specific social metadata', async ({ request }) => {
  const response = await request.get(`/result?score=${guestToken}&sv=3&lang=ko`);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['x-robots-tag']).toBe('noindex, follow');
  const html = await response.text();
  expect(html).toContain('<meta name="robots" content="noindex,follow" />');
  expect(html).toContain('가까운 장르 중 하나 · 재즈 힙합 · 비트 사이의 사색가');
  expect(html).toContain('장르 유사도 92%');
  expect(html).toContain(`/api/og?score=${guestToken}&amp;ogv=3&amp;sv=3`);
  expect(html).toContain(personalDestination.replaceAll('&', '&amp;'));
});

test('invalid personal score tokens are rejected without a misleading preview', async ({ request }) => {
  const response = await request.get('/result?score=v1.300.50.85.30.75&sv=2');
  expect(response.status()).toBe(400);
  expect(await response.text()).toContain('Invalid music result link');
});

test('the server also scores an identical profile at 100', async ({ request }) => {
  const response = await request.get('/result?score=v1.80.50.85.30.75&sv=3&lang=ko');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('장르 유사도 100%');
  expect(html).toContain('나의 음악 타입은 미니멀리즘 · 명상하는 완벽주의자');
});

test('English personal shares use the same translated type as the app', async ({ request, page }) => {
  const response = await request.get(`/result?score=${guestToken}&sv=3&lang=en`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('One of your nearby genres · Jazz Hip-Hop · Thoughtful Beat Explorer');
  await page.goto(`/result?score=${guestToken}&sv=3&lang=en`);
  await expect(page.getByRole('heading', { level: 1, name: /Jazz Hip-Hop/ })).toBeVisible();
});

test('Japanese personal shares use the same translated type and Japanese Open Graph image', async ({ request, page }) => {
  const response = await request.get(`/result?score=${guestToken}&sv=3&lang=ja`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('近いジャンルの一つ · ジャズ・ヒップホップ · 静かなビートの探検家');
  expect(html).toContain('property="og:locale" content="ja_JP"');
  expect(html).toContain(`/?v=3&amp;m=70&amp;u=61&amp;s=79&amp;i=48&amp;c=75&amp;lang=ja`);
  await page.goto(`/result?score=${guestToken}&sv=3&lang=ja`);
  await expect(page.getByRole('heading', { level: 1, name: /ジャズ・ヒップホップ/ })).toBeVisible();

  const imageResponse = await request.get(`/api/og?score=${guestToken}&sv=3&lang=ja`);
  expect(imageResponse.ok()).toBeTruthy();
  expect(imageResponse.headers()['content-disposition']).toContain('muti-result-ja.png');
  const image = Buffer.from(await imageResponse.body());
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);
  const englishImage = Buffer.from(await (await request.get(`/api/og?score=${guestToken}&sv=3&lang=en`)).body());
  expect(image.equals(englishImage)).toBe(false);
});

test('the personal result Open Graph endpoint returns a 1200x630 PNG', async ({ request }) => {
  const response = await request.get(`/api/og?score=${guestToken}&sv=3&lang=ko`);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toBe('image/png');
  expect(response.headers()['content-disposition']).toContain('muti-result-ko.png');
  const image = Buffer.from(await response.body());
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);
  expect(image.length).toBeGreaterThan(700_000);
  const englishImage = Buffer.from(await (await request.get(`/api/og?score=${guestToken}&sv=3&lang=en`)).body());
  expect(image.equals(englishImage)).toBe(false);
});

test('a visitor opening a personal share URL lands on the restored result', async ({ page }) => {
  await page.goto(`/result?score=${guestToken}&sv=3&lang=ko`);
  await expect(page).toHaveURL(new RegExp(`${personalDestination.replace(/[?&]/g, character => `\\${character}`)}$`));
  await expect(page.getByRole('heading', { level: 1, name: /재즈 힙합/ })).toBeVisible();
  await expect(page.getByText('이 장르의 소리 · 재즈의 온기와 느긋한 비트가 만나는 음악').first()).toBeVisible();
});

test('existing version 2 shares preserve their original genre and result after opening', async ({ request, page }) => {
  const response = await request.get(`/result?score=${guestToken}&sv=2&lang=ko`);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('가까운 장르 중 하나 · 인디 팝 · 감성적 몽상가');
  expect(html).toContain('장르 유사도 91%');
  expect(html).toContain(`/api/og?score=${guestToken}&amp;ogv=3&amp;sv=2`);
  expect(html).toContain('/?v=2&amp;m=70&amp;u=61&amp;s=79&amp;i=48&amp;c=75&amp;lang=ko');

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (url: string) => { Object.defineProperty(window, '__copiedResultUrl', { configurable: true, value: url }); } },
    });
  });
  await page.goto(`/result?score=${guestToken}&sv=2&lang=ko`);
  await expect(page).toHaveURL(/\?v=2&m=70&u=61&s=79&i=48&c=75&lang=ko$/);
  await expect(page.getByRole('heading', { level: 1, name: /인디 팝/ })).toBeVisible();
  await openShareMenu(page);
  await page.getByRole('button', { name: '링크 복사' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __copiedResultUrl?: string }).__copiedResultUrl)).toContain(`score=${guestToken}&sv=2&lang=ko`);
});
