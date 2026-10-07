import { expect, test } from '@playwright/test';
import questions from '../../src/data/questions.json';
import { SURVEY_VERSION } from '../../src/lib/surveyVersion';

const draftKey = 'music-personality-survey';
const invitation = 'compare=v1.82.46.74.31.68&hv=2';
const seededDraft = { questionVersion: SURVEY_VERSION, currentStep: 2, answers: { mellow_1: 4 }, startTime: '2026-10-04T00:00:00.000Z', isComplete: false };

async function saveDraft(page: import('@playwright/test').Page, value: unknown) {
  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)), { key: draftKey, value });
}

for (const [language, start, resume, fresh, firstQuestion, secondQuestion, previous] of [
  ['ko', '내 음악 성격 찾기', '이어서 검사하기', '처음부터 검사하기', '나는 조용하고 차분한 음악을 선호한다', '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다', '이전'],
  ['en', 'Find my music type', 'Continue my test', 'Start from the beginning', 'I prefer quiet and calm music', 'I like to meditate or relax while listening to music', 'Previous'],
  ['ja', '私の音楽性格を見つける', '続きから再開', '最初から始める', '静かで穏やかな音楽が好きだ', '音楽を聴きながら瞑想したり、くつろいだりするのが好きだ', '前へ'],
] as const) {
  test(`${language} offers an explicit resume choice and preserves answers through refresh and correction`, async ({ page }) => {
    await page.goto(`/?lang=${language}`);
    await saveDraft(page, seededDraft);
    await page.getByRole('button', { name: start, exact: true }).click();
    const choice = page.getByTestId('survey-resume-choice');
    await expect(choice).toBeVisible();
    await expect(page).not.toHaveURL(/view=survey/);
    await expect(choice.getByRole('heading')).toBeFocused();
    await expect(choice.getByRole('button', { name: fresh, exact: true })).toBeVisible();
    await choice.getByRole('button', { name: resume, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: secondQuestion })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: secondQuestion })).toBeVisible();
    await page.getByRole('button', { name: previous, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: firstQuestion })).toBeVisible();
    await expect(page.getByRole('radio', { name: /^4:/ })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  });
}

test('starting fresh explicitly removes saved responses without deleting recent personal results', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{ id: 'prior', scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 }, topGenreId: 'hiphop_jazz', resultVersion: 2, createdAt: Date.now() }])));
  await saveDraft(page, seededDraft);
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await page.getByTestId('survey-resume-choice').getByRole('button', { name: '처음부터 검사하기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}').answers, draftKey)).toEqual({});
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('music-personality-recent-results-v1') || '[]')[0].resultVersion)).toBe(2);
});

test('fresh-start intent works even if optional storage deletion fails and does not reset later refreshes', async ({ page }) => {
  await page.goto('/');
  await saveDraft(page, seededDraft);
  await page.evaluate(key => {
    const originalRemove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (name) {
      if (this === sessionStorage && name === key) throw new DOMException('Storage deletion blocked', 'SecurityError');
      return originalRemove.call(this, name);
    };
  }, draftKey);
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await page.getByTestId('survey-resume-choice').getByRole('button', { name: '처음부터 검사하기' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
  await page.getByRole('radio', { name: /^3:/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
});

test('invalid, obsolete, completed, and empty drafts do not offer a misleading resume choice', async ({ page }) => {
  for (const value of ['{broken-json', { ...seededDraft, questionVersion: 1 }, { ...seededDraft, questionVersion: 2 }, { ...seededDraft, comparisonHash: 'invalid' }, { ...seededDraft, isComplete: true }, { ...seededDraft, answers: {} }]) {
    await page.goto('/');
    await saveDraft(page, value);
    await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
    await expect(page.getByTestId('survey-resume-choice')).toHaveCount(0);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  }
});

test('a new friend test clears personal answers and its own draft resumes with the same host and version', async ({ page }) => {
  await page.goto(`/#${invitation}`);
  await saveDraft(page, seededDraft);
  await page.getByRole('button', { name: '내 음악 성격 검사하기', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('radio', { name: /^4:/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  const choice = page.getByTestId('survey-resume-choice');
  await expect(choice.getByText('친구와의 궁합 검사도 함께 이어집니다.')).toBeVisible();
  await choice.getByRole('button', { name: '이어서 검사하기' }).click();
  await expect(page).toHaveURL(/view=survey#compare=v1.82.46.74.31.68&hv=2$/);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: '음악을 들으며 명상하거나 휴식을 취하는 것을 좋아한다' })).toBeVisible();
  await page.getByRole('button', { name: '이전', exact: true }).click();
  await expect(page.getByRole('radio', { name: /^4:/ })).toHaveAttribute('aria-checked', 'true');
});

test('starting fresh from an old friend draft deliberately starts a personal test', async ({ page }) => {
  await page.goto('/');
  await saveDraft(page, { ...seededDraft, comparisonHash: invitation });
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await page.getByTestId('survey-resume-choice').getByRole('button', { name: '처음부터 검사하기' }).click();
  await expect(page).toHaveURL(/\/?\?view=survey$/);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}').comparisonHash, draftKey)).toBeNull();
});

test('a draft from another friend or from a friend test is not reused by a different survey context', async ({ page }) => {
  for (const path of ['/?view=survey#compare=v1.20.30.40.50.60', '/?view=survey']) {
    await page.goto('/');
    await saveDraft(page, { ...seededDraft, comparisonHash: invitation });
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: '나는 조용하고 차분한 음악을 선호한다' })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
  }
});

test('the last unanswered question is below 100 percent and completion clears the friend draft', async ({ page }) => {
  await page.goto('/');
  await saveDraft(page, { ...seededDraft, currentStep: 40, comparisonHash: invitation, answers: Object.fromEntries(questions.slice(0, -1).map(question => [question.id, 3])) });
  await page.goto(`/?view=survey#${invitation}`);
  await expect(page.getByRole('radio')).toHaveCount(5);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '98');
  await page.getByRole('radio', { name: /^3:/ }).click();
  await expect(page).toHaveURL(/guest=v1.50.50.50.50.50&hv=2$/);
  await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
  await page.goto('/');
  await page.getByRole('button', { name: '내 음악 성격 찾기', exact: true }).click();
  await expect(page.getByTestId('survey-resume-choice')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});
