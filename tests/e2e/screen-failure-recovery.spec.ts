import { expect, test, type Route } from '@playwright/test';

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });
const surveyMarker = 'LISTEN TO YOUR TASTE';
const draft = { questionVersion: 3, currentStep: 2, answers: { mellow_1: 4 }, startTime: '2026-10-04T00:00:00.000Z', isComplete: false };

test('a failed initial question-data chunk recovers on a user retry rather than staying stuck in a cached failure', async ({ page }) => {
  await page.addInitScript(value => {
    if (!sessionStorage.getItem('music-personality-survey')) sessionStorage.setItem('music-personality-survey', JSON.stringify(value));
  }, draft);
  let blocked = 0;
  const failData = async (route: Route) => {
    const response = await route.fetch();
    if ((await response.text()).includes('I prefer quiet and calm music')) {
      blocked++;
      await route.abort('failed');
    } else await route.fulfill({ response });
  };
  await page.route('**/_next/static/chunks/*.js', failData);
  await page.goto('/?view=survey&lang=ja');
  const currentUrl = page.url();
  const recovery = page.getByTestId('data-load-recovery');
  await expect(recovery.getByRole('heading', { name: 'テストを読み込めませんでした。', exact: true })).toBeVisible();
  expect(blocked).toBe(1);
  await page.waitForTimeout(500);
  expect(blocked).toBe(1);
  expect(page.url()).toBe(currentUrl);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('music-personality-survey')!).answers)).toEqual({ mellow_1: 4 });
  await page.unroute('**/_next/static/chunks/*.js', failData);
  await page.route('**/_next/static/chunks/*.js', route => route.continue());
  await recovery.getByRole('button', { name: 'もう一度', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '音楽を聴きながら瞑想したり、くつろいだりするのが好きだ', exact: true })).toBeVisible();
  await expect(page.getByTestId('data-load-recovery')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  expect(page.url()).toBe(currentUrl);
});

for (const [lang, title, retry, secondQuestion] of [
  ['ko', '화면을 불러오지 못했어요.', '화면 다시 불러오기', '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다'],
  ['en', 'This screen could not be loaded.', 'Load this screen again', 'I like to meditate or relax while listening to music'],
  ['ja', '画面を読み込めませんでした。', '画面をもう一度読み込む', '音楽を聴きながら瞑想したり、くつろいだりするのが好きだ'],
] as const) {
  test(`${lang} recovers a genuinely failed lazy-screen request only after an explicit retry without losing answers`, async ({ page }) => {
    await page.addInitScript(value => sessionStorage.setItem('music-personality-survey', JSON.stringify(value)), draft);
    let blocked = 0;
    const failSurvey = async (route: Route) => {
      const response = await route.fetch();
      const code = await response.text();
      if (code.includes(surveyMarker)) {
        blocked++;
        await route.abort('failed');
      } else await route.fulfill({ response });
    };
    await page.route('**/_next/static/chunks/*.js', failSurvey);
    await page.goto(`/?view=survey&lang=${lang}`);
    const resultUrl = page.url();
    const recovery = page.getByTestId('screen-recovery');
    await expect(recovery.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(recovery.getByRole('heading')).toBeFocused();
    expect(blocked).toBe(1);
    // Neither the boundary nor its loading fallback runs a background retry loop.
    await page.waitForTimeout(500);
    expect(blocked).toBe(1);
    expect(page.url()).toBe(resultUrl);
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('music-personality-survey')!).answers)).toEqual({ mellow_1: 4 });
    await page.unroute('**/_next/static/chunks/*.js', failSurvey);
    await page.route('**/_next/static/chunks/*.js', route => route.continue());
    await recovery.getByRole('button', { name: retry, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: secondQuestion, exact: true })).toBeVisible();
    await expect(page.getByTestId('screen-recovery')).toHaveCount(0);
    expect(page.url()).toBe(resultUrl);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const [screen, marker, path] of [
  ['personal result', 'personal-track-change-note', '/?lang=en&v=2&m=70&u=61&s=79&i=48&c=75'],
  ['genre explorer', 'GENRE PERSONALITIES', '/?lang=en&view=genre-explorer'],
  ['friend invite', 'INVITE / 01', '/?lang=en#compare=v1.82.46.74.31.68&hv=2'],
  ['comparison result', 'pair-identities', '/?lang=en#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75&hv=2&gv=2'],
] as const) {
  test(`${screen} has a real chunk-failure recovery path that preserves its exact result or view URL`, async ({ page }) => {
    const failScreen = async (route: Route) => {
      const response = await route.fetch();
      if ((await response.text()).includes(marker)) await route.abort('failed');
      else await route.fulfill({ response });
    };
    await page.route('**/_next/static/chunks/*.js', failScreen);
    await page.goto(path);
    const currentUrl = page.url();
    await expect(page.getByTestId('screen-recovery')).toBeVisible();
    expect(page.url()).toBe(currentUrl);
    await page.unroute('**/_next/static/chunks/*.js', failScreen);
    await page.route('**/_next/static/chunks/*.js', route => route.continue());
    await page.getByRole('button', { name: 'Load this screen again', exact: true }).click();
    await expect(page.getByTestId('screen-recovery')).toHaveCount(0);
    await expect(page.locator('main h1')).toBeVisible();
    expect(page.url()).toBe(currentUrl);
  });
}

test('a render exception can return home without deleting the draft and an explicit reload restores the screen', async ({ page }) => {
  await page.addInitScript(value => {
    if (!sessionStorage.getItem('music-personality-survey')) sessionStorage.setItem('music-personality-survey', JSON.stringify(value));
  }, draft);
  let injected = 0;
  const throwDuringRender = async (route: Route) => {
    const response = await route.fetch();
    const code = await response.text();
    const literal = JSON.stringify(surveyMarker);
    if (code.includes(literal)) {
      injected++;
      await route.fulfill({ response, body: code.replace(literal, '(()=>{throw new Error("simulated screen render failure")})()') });
    } else await route.fulfill({ response });
  };
  await page.route('**/_next/static/chunks/*.js', throwDuringRender);
  await page.goto('/?view=survey');
  await expect(page.getByTestId('screen-recovery')).toBeVisible();
  expect(injected).toBe(1);
  await page.getByRole('button', { name: '홈으로 돌아가기', exact: true }).click();
  await expect(page.locator('.intro-facts')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('music-personality-survey')!).answers)).toEqual({ mellow_1: 4 });
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await page.getByRole('button', { name: '이어서 검사하기', exact: true }).click();
  await expect(page.getByTestId('screen-recovery')).toBeVisible();
  const currentUrl = page.url();
  await page.unroute('**/_next/static/chunks/*.js', throwDuringRender);
  // Keep HTTP caching disabled after the deliberately altered immutable asset.
  await page.route('**/_next/static/chunks/*.js', route => route.continue());
  await page.getByRole('button', { name: '이 페이지 새로고침', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeVisible();
  expect(page.url()).toBe(currentUrl);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
});
