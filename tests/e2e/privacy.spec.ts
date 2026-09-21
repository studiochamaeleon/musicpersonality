import { expect, test } from '@playwright/test';

test('Korean privacy text accurately discloses share-link score transmission', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: '개인정보 보호정책' })).toBeVisible();
  await expect(page.getByText('SNS 미리보기가 있는 개인·친구 공유 링크는 점수를 URL 쿼리에 담아 Cloudflare Pages Function으로 전달합니다')).toBeVisible();
  await expect(page.getByText('최근 사용 이벤트 최대 100건과 결과 이력 최대 3건을 기기에 저장합니다')).toBeVisible();
  await expect(page.locator('.legal-page')).toHaveCSS('background-color', 'rgb(7, 8, 10)');
});

test('English privacy text gives the same disclosure', async ({ page }) => {
  await page.goto('/privacy?lang=en');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
  await expect(page.getByText('Personal and friend share links with social previews put scores in the URL query sent to a Cloudflare Pages Function')).toBeVisible();
});

test('terms list items render and describe the assessment honestly', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByRole('heading', { level: 1, name: '이용약관' })).toBeVisible();
  await expect(page.getByText('결과는 검증된 심리 진단이나 음악 선호 확률이 아닙니다.', { exact: false })).toBeVisible();
  await expect(page.getByText('평가 결과는 오락 및 교육 목적으로만 제공됩니다')).toBeVisible();
});
