import { expect, test } from '@playwright/test';

const resultUrl = '/?v=2&m=80&u=50&s=85&i=30&c=75&lang=ko';

test('an exact genre profile scores 95 and explains the similarity', async ({ page }) => {
  await page.goto(resultUrl);
  await expect(page.getByRole('heading', { level: 1, name: /미니멀리즘/ })).toBeVisible();
  await expect(page.getByText('명상하는 완벽주의자', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('섬세한 반복 속에서 평온을 찾는 음악을 사랑하는').first()).toBeVisible();
  await expect(page.getByText('95%', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: '이 장르가 나온 이유' })).toBeVisible();
  await expect(page.getByText('음악을 좋아할 확률이나 검증된 성격 진단 결과는 아닙니다.', { exact: false })).toBeVisible();

  await page.getByText('다섯 축 직접 비교하기').click();
  const compare = page.getByRole('group', { name: '다섯 축 직접 비교하기' });
  await expect(compare.getByRole('button')).toHaveCount(5);
  await compare.getByRole('button', { name: '강렬함' }).click();
  await expect(compare.getByRole('button', { name: '강렬함' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', { name: '선택한 취향 축' })).toContainText('30');
});

test('the full result includes every previously hidden analysis field', async ({ page }) => {
  await page.goto(resultUrl);
  await expect(page.getByRole('heading', { name: '추천 장르의 사운드' })).toBeVisible();
  await expect(page.getByText('내 검사 점수가 아닌 추천 장르의 사운드 프로필입니다.', { exact: false })).toBeVisible();
  const deepDive = page.getByTestId('personality-deep-dive');
  await expect(deepDive).toHaveAttribute('open', '');

  await expect(page.getByRole('heading', { name: '강점' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '도전 과제' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '관계에서의 모습' })).toBeVisible();
  await expect(page.getByText('깊이 있고 성숙한 대화를 나눌 수 있는 파트너를 선호하며', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: '어울리는 음악' })).toBeVisible();
  await expect(page.getByText('작업이나 공부 시 집중력을 높이는 배경음악')).toBeVisible();
  await expect(page.getByRole('heading', { name: '해볼 만한 활동' })).toBeVisible();
  await expect(page.getByText('클래식 음악회나 현대음악 페스티벌 참석')).toBeVisible();
  await expect(page.getByRole('heading', { name: '이럴 때 들어보세요' })).toBeVisible();
  await deepDive.locator('summary').click();
  await expect(deepDive).not.toHaveAttribute('open', '');
  await deepDive.locator('summary').click();
  await expect(deepDive).toHaveAttribute('open', '');
});

test('the genre detail is keyboard-modal and restores focus on close', async ({ page }) => {
  await page.goto('/?view=genre-explorer');
  const card = page.getByRole('button', { name: /미니멀리즘/ }).first();
  await card.click();
  const dialog = page.getByRole('dialog', { name: '미니멀리즘' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.parentElement?.parentElement === document.body)).toBe(true);
  await expect(dialog.getByRole('button', { name: '닫기' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();
});

test('corrupted local usage history does not block genre exploration', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('analyticsEvents', '{broken');
    localStorage.setItem('musicPersonalityAnalytics', '{broken');
  });
  await page.goto('/?view=genre-explorer');
  await page.getByRole('button', { name: /미니멀리즘/ }).first().click();
  await expect(page.getByRole('dialog', { name: '미니멀리즘' })).toBeVisible();
});

test('the quiz and restored result work when browser storage is denied', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, name, {
        configurable: true,
        get() { throw new DOMException('Storage denied', 'SecurityError'); },
      });
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: '내 음악 성격 찾기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  for (let index = 0; index < 40; index += 1) {
    const currentQuestion = await page.getByRole('heading', { level: 1 }).textContent();
    await page.getByRole('radio', { name: /^3:/ }).click();
    if (index < 39) await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(currentQuestion || '');
  }
  await expect(page).toHaveURL(/\?v=2&m=/);
  await page.reload();
  await expect(page.getByRole('button', { name: '친구와 음악 궁합 보기' })).toBeVisible();
});

test('answer selection advances, while Previous permits correction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '내 음악 성격 찾기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3: 보통이다' })).toBeVisible();
  await page.getByRole('radio', { name: '3: 보통이다' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeHidden();
  await page.getByRole('button', { name: '이전' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3: 보통이다' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: '4: 그렇다' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeHidden();
});

test('a damaged saved survey cannot finish with unanswered dimensions', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('music-personality-survey', JSON.stringify({ currentStep: 40, answers: {}, startTime: new Date().toISOString(), isComplete: false })));
  await page.goto('/');
  await page.getByRole('button', { name: '내 음악 성격 찾기' }).click();
  await expect(page.getByRole('radio')).toHaveCount(5);
  await page.getByRole('radio').nth(2).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '명상하는 완벽주의자' })).toHaveCount(0);
});

test('English results expose the complete interpretation', async ({ page }) => {
  await page.goto('/?v=2&m=80&u=50&s=85&i=30&c=75&lang=en');
  await expect(page.getByRole('heading', { level: 1, name: /Minimalism/ })).toBeVisible();
  await expect(page.getByText('Essential Minimalist', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recommended genre sound' })).toBeVisible();
  await expect(page.getByTestId('personality-deep-dive')).toHaveAttribute('open', '');
  await expect(page.getByRole('heading', { name: 'Relationships' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Music to try' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Activities to try' })).toBeVisible();
  await expect(page.getByText('The personality note below is a playful interpretation', { exact: false })).toBeVisible();
});

test('Japanese covers the intro, survey, full result, and genre explorer', async ({ page }) => {
  await page.goto('/?lang=ja');
  await expect(page.getByRole('heading', { level: 1, name: /好きな音を辿れば、\s*あなたが見える。/ })).toBeVisible();
  await page.getByRole('button', { name: '私の音楽性格を見つける' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '静かで穏やかな音楽が好きだ' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3: どちらともいえない' })).toBeVisible();

  await page.goto('/?v=2&m=80&u=50&s=85&i=30&c=75&lang=ja');
  await expect(page.getByRole('heading', { level: 1, name: /ミニマリズム/ })).toBeVisible();
  await expect(page.getByText('瞑想する完璧主義者', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'おすすめジャンルのサウンド' })).toBeVisible();
  await expect(page.getByTestId('personality-deep-dive')).toHaveAttribute('open', '');
  await expect(page.getByRole('heading', { name: '人間関係での傾向' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'おすすめの音' })).toBeVisible();

  await page.goto('/?view=genre-explorer&lang=ja');
  await expect(page.getByRole('heading', { level: 1, name: 'ジャンルにも、性格がある。' })).toBeVisible();
  await page.getByRole('button', { name: /ミニマリズム/ }).first().click();
  await expect(page.getByRole('dialog', { name: 'ミニマリズム' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '核心的な特徴' })).toBeVisible();
});

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('result and genre explorer fit the viewport without horizontal scroll', async ({ page }) => {
    await page.goto(resultUrl);
    await expect(page.getByRole('heading', { level: 1, name: /미니멀리즘/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.goto('/?view=genre-explorer');
    await expect(page.getByRole('heading', { level: 1, name: '장르에도 성격이 있습니다.' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});
