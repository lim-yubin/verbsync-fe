import { test, expect } from './fixtures/auth';

test.describe('멤버 관리 (Members)', () => {
  test('멤버 목록 조회', async ({ authenticatedPage: page }) => {
    await page.goto('/members');
    await page.waitForLoadState('networkidle');

    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/members') &&
        response.request().method() === 'GET' &&
        !response.url().includes('/members/') &&
        !response.url().includes('/members/me') &&
        !response.url().includes('/members/invite')
    );

    await page.reload();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('members');
    expect(Array.isArray(data.members)).toBe(true);
  });

  test('멤버 권한 조회', async ({ authenticatedPage: page }) => {
    await page.goto('/members');
    await page.waitForLoadState('networkidle');

    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/members/me') &&
        response.request().method() === 'GET'
    );

    await page.reload();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('canEdit');
    expect(data).toHaveProperty('canManageSettings');
    expect(data).toHaveProperty('canManageMembers');
  });

  test('멤버 초대 (Starter 플랜 이상)', async ({ authenticatedPage: page }) => {
    await page.goto('/members');

    // 멤버 초대 버튼 확인
    const inviteButton = page.locator('button:has-text("멤버 초대")');
    
    if (await inviteButton.count() > 0 && !(await inviteButton.isDisabled())) {
      await inviteButton.click();

      // 다이얼로그 확인
      await expect(page.locator('text=멤버 초대')).toBeVisible();

      // 폼 작성
      const email = `invite-${Date.now()}@example.com`;
      await page.fill('input[type="email"]', email);
      await page.selectOption('select[name="role"]', 'EDITOR');

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/members/invite') &&
          response.request().method() === 'POST'
      );

      // 초대 버튼 클릭
      await page.click('button:has-text("초대")');

      const response = await responsePromise;
      expect(response.status()).toBe(201);
    }
  });
});

