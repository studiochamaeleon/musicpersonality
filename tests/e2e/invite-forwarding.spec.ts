import { expect, test, type Page } from '@playwright/test';

const host = 'v1.82.46.74.31.68';
const recipient = 'v1.70.61.79.48.75';
const personal = '/?v=2&m=82&u=46&s=74&i=31&c=68';

interface InviteForwardingState {
  mode: 'allowed' | 'cancelled' | 'denied';
  shares: ShareData[];
  copyCalls: number;
}

declare global {
  interface Window { __inviteForwarding?: InviteForwardingState }
}

async function mockShareAndRecipientResult(page: Page) {
  await page.addInitScript(() => {
    const state: InviteForwardingState = { mode: 'allowed', shares: [], copyCalls: 0 };
    window.__inviteForwarding = state;
    localStorage.setItem('music-personality-recent-results-v1', JSON.stringify([{
      id: 'recipient-result',
      scores: { mellow: 70, unpretentious: 61, sophisticated: 79, intense: 48, contemporary: 75 },
      topGenreId: 'pop_indie',
      createdAt: Date.now(),
      resultVersion: 3,
    }]));
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (payload: ShareData) => {
      state.shares.push(payload);
      if (state.mode !== 'allowed') throw new DOMException('Share unavailable', state.mode === 'cancelled' ? 'AbortError' : 'NotAllowedError');
    } });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {
      state.copyCalls += 1;
      throw new DOMException('Clipboard blocked', 'NotAllowedError');
    } } });
  });
}

const cases = [
  {
    lang: 'ko', invite: '친구와 음악 궁합 보기', send: '초대 링크 보내기', forward: '받은 초대 전달',
    ownTitle: '우리 음악 궁합은 몇 퍼센트?', ownText: '내 음악 취향과 얼마나 닮았는지 확인해봐!',
    forwardedTitle: '초대한 사람과 음악 궁합은 몇 퍼센트?', forwardedText: '초대한 사람의 음악 취향과 얼마나 닮았는지 확인해봐!',
    hint: '전달받는 사람은 원래 초대한 사람과 비교하게 돼요. 내 결과로 초대하는 링크는 아니에요.',
    copy: '링크 복사', manual: '직접 복사할 초대 링크',
  },
  {
    lang: 'en', invite: 'Compare with a friend', send: 'Send invite link', forward: 'Forward this invite',
    ownTitle: 'How compatible are our music tastes?', ownText: 'Take the test and compare your music taste with mine.',
    forwardedTitle: 'How well do you match this inviter?', forwardedText: 'Compare your music taste with the original inviter.',
    hint: 'The recipient will compare with the original inviter. This is not an invite with your own result.',
    copy: 'Copy link', manual: 'Invite link for manual copying',
  },
  {
    lang: 'ja', invite: '友達と音楽相性を見る', send: '招待リンクを送る', forward: '届いた招待を転送',
    ownTitle: '私たちの音楽相性は何％？', ownText: 'テストで私との音楽の好みを比べてみて！',
    forwardedTitle: '招待した人との音楽相性は何％？', forwardedText: '招待した人との音楽の好みを比べてみて！',
    hint: '転送先では元の招待者との相性を比較します。あなたの結果で招待するリンクではありません。',
    copy: 'リンクをコピー', manual: '手動コピー用の招待リンク',
  },
];

function expectedParams(language: string) {
  return { host, ...(language === 'ko' ? {} : { lang: language }), hv: '2' };
}

function expectOriginalInvite(url: string, language: string) {
  const parsed = new URL(url);
  expect(parsed.pathname).toBe('/share');
  expect(Object.fromEntries(parsed.searchParams)).toEqual(expectedParams(language));
  expect(parsed.searchParams.get('host')).not.toBe(recipient);
  expect(parsed.hash).toBe('');
}

for (const copy of cases) {
  test(`created and forwarded invitations identify the correct owner in ${copy.lang}`, async ({ page, context }) => {
    await mockShareAndRecipientResult(page);
    await page.goto(`${personal}&lang=${copy.lang}`);
    await page.getByRole('button', { name: copy.invite, exact: true }).first().click();
    const send = page.getByRole('button', { name: copy.send, exact: true });
    await expect(send).toHaveClass(/primary-action/);
    await expect(page.getByRole('button', { name: copy.forward, exact: true })).toHaveCount(0);
    await send.click();
    const created = await page.evaluate(() => window.__inviteForwarding!.shares);
    expect(created).toHaveLength(1);
    expect(created[0].title).toBe(copy.ownTitle);
    expect(created[0].text).toBe(copy.ownText);
    expectOriginalInvite(created[0].url!, copy.lang);

    // Model a recipient opening the invite, not the creator revisiting the
    // identical URL. Browsers need not dispatch navigation events in that case.
    const receivedPage = await context.newPage();
    await mockShareAndRecipientResult(receivedPage);
    await receivedPage.goto(`/?lang=${copy.lang}#compare=${host}&hv=2`);
    const forward = receivedPage.getByRole('button', { name: copy.forward, exact: true });
    await expect(forward).toBeVisible();
    await expect(receivedPage.getByText(copy.hint, { exact: true })).toBeVisible();
    await expect(receivedPage.getByRole('button', { name: copy.send, exact: true })).toHaveCount(0);
    await forward.click();
    const forwarded = await receivedPage.evaluate(() => window.__inviteForwarding!.shares);
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0].title).toBe(copy.forwardedTitle);
    expect(forwarded[0].text).toBe(copy.forwardedText);
    expectOriginalInvite(forwarded[0].url!, copy.lang);
    await receivedPage.close();
  });

  test(`forward cancellation stays quiet and manual recovery preserves the original invite in ${copy.lang}`, async ({ page }) => {
    await mockShareAndRecipientResult(page);
    await page.goto(`/?lang=${copy.lang}#compare=${host}&hv=2`);
    await page.evaluate(() => { window.__inviteForwarding!.mode = 'cancelled'; });
    const forward = page.getByRole('button', { name: copy.forward, exact: true });
    await forward.click();
    await expect(page.getByTestId('invite-manual-link')).toHaveCount(0);
    await expect(page.locator('[aria-live="polite"]')).toHaveText('');
    expect(await page.evaluate(() => window.__inviteForwarding!.copyCalls)).toBe(0);

    await page.evaluate(() => { window.__inviteForwarding!.mode = 'denied'; });
    await forward.click();
    const field = page.getByRole('textbox', { name: copy.manual, exact: true });
    await expect(field).toBeVisible();
    expectOriginalInvite(await field.inputValue(), copy.lang);
    await page.getByRole('button', { name: copy.copy, exact: true }).click();
    expectOriginalInvite(await field.inputValue(), copy.lang);
    expect(await page.evaluate(() => window.__inviteForwarding!.copyCalls)).toBe(1);

    await page.evaluate(() => { window.__inviteForwarding!.mode = 'allowed'; });
    await forward.click();
    await expect(field).toHaveCount(0);
    const forwarded = await page.evaluate(() => window.__inviteForwarding!.shares);
    expect(forwarded).toHaveLength(3);
    expectOriginalInvite(forwarded[2].url!, copy.lang);
  });
}
