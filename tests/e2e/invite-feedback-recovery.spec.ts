import { expect, test, type Page } from '@playwright/test';

const host = 'v1.82.46.74.31.68';
const personal = '/?v=2&m=82&u=46&s=74&i=31&c=68';

interface ManualRecoveryState {
  allowCopy: boolean;
  shareMode: 'cancelled' | 'denied' | 'allowed';
  copyCalls: number;
  copied: string[];
  shares: ShareData[];
  downloads: number;
}

declare global {
  interface Window { __manualRecovery?: ManualRecoveryState }
}

async function mockBlockedAPIs(page: Page) {
  await page.addInitScript(() => {
    const state: ManualRecoveryState = { allowCopy: false, shareMode: 'cancelled', copyCalls: 0, copied: [], shares: [], downloads: 0 };
    window.__manualRecovery = state;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => {
      state.copyCalls += 1;
      if (!state.allowCopy) throw new DOMException('Clipboard blocked', 'NotAllowedError');
      state.copied.push(value);
    } } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (payload: ShareData) => {
      state.shares.push(payload);
      if (state.shareMode !== 'allowed') throw new DOMException('Share unavailable', state.shareMode === 'cancelled' ? 'AbortError' : 'NotAllowedError');
    } });
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (this.download) { state.downloads += 1; return; }
      originalClick.call(this);
    };
  });
}

const cases = [
  { lang: 'ko', invite: '친구와 음악 궁합 보기', copy: '링크 복사', share: '초대 링크 보내기', manualInvite: '직접 복사할 초대 링크', selectInvite: '초대 링크 전체 선택', copyFailure: '자동 복사가 차단됐어요.', feedbackCopy: '피드백 내용 복사', manualFeedback: '직접 복사할 피드백', selectFeedback: '피드백 전체 선택', copiedFeedback: '복사했어요.' },
  { lang: 'en', invite: 'Compare with a friend', copy: 'Copy link', share: 'Send invite link', manualInvite: 'Invite link for manual copying', selectInvite: 'Select the whole invite link', copyFailure: 'Automatic copying is blocked.', feedbackCopy: 'Copy feedback', manualFeedback: 'Feedback for manual copying', selectFeedback: 'Select all feedback', copiedFeedback: 'Copied.' },
  { lang: 'ja', invite: '友達と音楽相性を見る', copy: 'リンクをコピー', share: '招待リンクを送る', manualInvite: '手動コピー用の招待リンク', selectInvite: '招待リンクをすべて選択', copyFailure: '自動コピーが制限されています。', feedbackCopy: '感想をコピー', manualFeedback: '手動コピー用の感想', selectFeedback: '感想をすべて選択', copiedFeedback: 'コピーしました。' },
];

function inviteParams(language: string) {
  return { host, ...(language === 'ko' ? {} : { lang: language }), hv: '2' };
}

async function expectAllSelected(field: ReturnType<Page['getByRole']>) {
  await expect(field).toBeFocused();
  const selection = await field.evaluate(element => {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    return { start: input.selectionStart, end: input.selectionEnd, length: input.value.length };
  });
  expect(selection.start).toBe(0);
  expect(selection.end).toBe(selection.length);
}

for (const copy of cases) {
  test(`invite clipboard denial exposes a selectable URL and successful copying clears recovery in ${copy.lang}`, async ({ page }) => {
    await mockBlockedAPIs(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/?lang=${copy.lang}#compare=${host}&hv=2`);
    await expect(page.getByTestId('invite-manual-link')).toHaveCount(0);
    await page.getByRole('button', { name: copy.copy, exact: true }).click();
    const field = page.getByRole('textbox', { name: copy.manualInvite, exact: true });
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('readonly');
    expect(Object.fromEntries(new URL(await field.inputValue()).searchParams)).toEqual(inviteParams(copy.lang));
    expect(await field.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    await page.getByRole('button', { name: copy.selectInvite, exact: true }).click();
    await expectAllSelected(field);
    const beforeRetry = await page.evaluate(() => window.__manualRecovery!);
    expect(beforeRetry.copyCalls).toBe(1);
    expect(beforeRetry.copied).toEqual([]);
    expect(beforeRetry.shares).toEqual([]);
    expect(beforeRetry.downloads).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.evaluate(() => { window.__manualRecovery!.allowCopy = true; });
    await page.getByRole('button', { name: copy.copy, exact: true }).click();
    await expect(field).toHaveCount(0);
    const copied = await page.evaluate(() => window.__manualRecovery!.copied);
    expect(copied).toHaveLength(1);
    expect(Object.fromEntries(new URL(copied[0]).searchParams)).toEqual(inviteParams(copy.lang));
  });

  test(`invite cancellation stays quiet and a real sharing failure gets manual recovery in ${copy.lang}`, async ({ page }) => {
    await mockBlockedAPIs(page);
    await page.goto(`${personal}&lang=${copy.lang}`);
    await page.getByRole('button', { name: copy.invite, exact: true }).first().click();
    const share = page.getByRole('button', { name: copy.share, exact: true });
    await expect(share).toHaveClass(/primary-action/);
    await share.click();
    await expect(page.getByTestId('invite-manual-link')).toHaveCount(0);
    let state = await page.evaluate(() => window.__manualRecovery!);
    expect(state.shares).toHaveLength(1);
    expect(state.copyCalls).toBe(0);
    expect(state.downloads).toBe(0);
    await expect(page.locator('[aria-live="polite"]')).toHaveText('');
    await page.evaluate(() => { window.__manualRecovery!.shareMode = 'denied'; });
    await share.click();
    const field = page.getByRole('textbox', { name: copy.manualInvite, exact: true });
    await expect(field).toBeVisible();
    expect(Object.fromEntries(new URL(await field.inputValue()).searchParams)).toEqual(inviteParams(copy.lang));
    await page.getByRole('button', { name: copy.selectInvite, exact: true }).click();
    await expectAllSelected(field);
    state = await page.evaluate(() => window.__manualRecovery!);
    expect(state.shares).toHaveLength(2);
    expect(state.copyCalls).toBe(0);
    expect(state.downloads).toBe(0);
    await page.evaluate(() => { window.__manualRecovery!.shareMode = 'allowed'; });
    await share.click();
    await expect(field).toHaveCount(0);
    state = await page.evaluate(() => window.__manualRecovery!);
    expect(state.shares).toHaveLength(3);
    expect(Object.fromEntries(new URL(state.shares[2].url!).searchParams)).toEqual(inviteParams(copy.lang));
    expect(state.copyCalls).toBe(0);
    expect(state.downloads).toBe(0);
  });

  test(`feedback clipboard denial opens a readonly report without leaking score links in ${copy.lang}`, async ({ page }) => {
    await mockBlockedAPIs(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${personal}&lang=${copy.lang}`);
    const feedback = page.getByTestId('result-feedback');
    await feedback.locator('summary').first().click();
    await feedback.locator('select').first().selectOption('fits');
    await feedback.locator('textarea').fill('The recommended songs helped me discover something new.');
    const preview = feedback.getByTestId('feedback-preview-panel');
    await expect(preview).not.toHaveAttribute('open');
    await expect(feedback.getByTestId('feedback-manual-report')).toHaveCount(0);
    await feedback.getByRole('button', { name: copy.feedbackCopy, exact: true }).click();
    await expect(preview).toHaveAttribute('open');
    const field = feedback.getByRole('textbox', { name: copy.manualFeedback, exact: true });
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('readonly');
    const report = await field.inputValue();
    expect(report).toContain('The recommended songs helped me discover something new.');
    expect(report).not.toMatch(/mellow|unpretentious|sophisticated|intense|contemporary|v1\.|https?:\/\/|\?score=|#compare=/);
    expect(await field.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    await feedback.getByRole('button', { name: copy.selectFeedback, exact: true }).click();
    await expectAllSelected(field);
    const beforeRetry = await page.evaluate(() => window.__manualRecovery!);
    expect(beforeRetry.copyCalls).toBe(1);
    expect(beforeRetry.copied).toEqual([]);
    expect(beforeRetry.shares).toEqual([]);
    expect(beforeRetry.downloads).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.evaluate(() => { window.__manualRecovery!.allowCopy = true; });
    await feedback.getByRole('button', { name: copy.feedbackCopy, exact: true }).click();
    await expect(field).toHaveCount(0);
    await expect(feedback.getByTestId('feedback-preview')).toHaveText(report);
    await expect(feedback.getByRole('status')).toContainText(copy.copiedFeedback);
    expect(await page.evaluate(() => window.__manualRecovery!.copied)).toEqual([report]);
  });
}

test('invite sending and feedback copying both recover when Share and Clipboard APIs are missing', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  await page.goto(`/#compare=${host}&hv=2`);
  await page.getByRole('button', { name: '받은 초대 전달', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '직접 복사할 초대 링크', exact: true })).toBeVisible();
  await page.goto(personal);
  const feedback = page.getByTestId('result-feedback');
  await feedback.locator('summary').first().click();
  await feedback.locator('select').first().selectOption('fits');
  await feedback.getByRole('button', { name: '피드백 내용 복사', exact: true }).click();
  await expect(feedback.getByTestId('feedback-preview-panel')).toHaveAttribute('open');
  await expect(feedback.getByRole('textbox', { name: '직접 복사할 피드백', exact: true })).toBeVisible();
});
