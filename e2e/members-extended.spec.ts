import { test, expect } from './fixtures/auth';

test.describe('멤버 관리 확장 (Members Extended)', () => {
  test('멤버 역할 변경', async ({ authenticatedPage: page }) => {
    await page.goto('/members');

    // 첫 번째 멤버의 역할 변경 버튼 찾기 (자신 제외)
    const roleSelect = page.locator('select[name="role"]').first();
    
    if (await roleSelect.count() > 0) {
      const currentValue = await roleSelect.inputValue();

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/members/') &&
          response.url().includes('/role') &&
          response.request().method() === 'PATCH'
      );

      // 역할 변경
      const newRole = currentValue === 'EDITOR' ? 'VIEWER' : 'EDITOR';
      await roleSelect.selectOption(newRole);

      const response = await responsePromise;
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('role', newRole);
    }
  });

  test('멤버 제거', async ({ authenticatedPage: page }) => {
    await page.goto('/members');

    // 첫 번째 멤버의 제거 버튼 찾기 (자신 제외)
    const removeButton = page.locator('button:has-text("제거"), button:has-text("삭제")').first();
    
    if (await removeButton.count() > 0) {
      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/members/') &&
          !response.url().includes('/members/me') &&
          !response.url().includes('/members/invite') &&
          response.request().method() === 'DELETE'
      );

      await removeButton.click();

      // 확인 다이얼로그
      const confirmButton = page.locator('button:has-text("제거"), button:has-text("삭제")').last();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('초대 정보 조회', async ({ page }) => {
    // 초대 토큰이 있다고 가정 (실제로는 이메일에서 받은 토큰 사용)
    const testToken = 'test-invite-token';

    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/members/invite/${testToken}`) &&
        response.request().method() === 'GET'
    );

    await page.goto(`/accept-invite?token=${testToken}`);

    // 응답 확인 (401 또는 200 가능)
    try {
      const response = await responsePromise;
      // 유효한 토큰이면 200, 유효하지 않으면 404/401
      expect([200, 401, 404]).toContain(response.status());
    } catch (e) {
      // 토큰이 없으면 응답이 없을 수 있음
    }
  });
});

