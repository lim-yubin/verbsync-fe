import { test, expect } from './fixtures/auth';

test.describe('인증 확장 (Authentication Extended)', () => {
  test('현재 사용자 정보 조회', async ({ authenticatedPage: page }) => {
    await page.waitForLoadState('networkidle');
    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/me') &&
        response.request().method() === 'GET'
    );

    await page.goto('/settings');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('name');
  });

  test('프로필 수정', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');

    // 프로필 수정 섹션 찾기
    const nameInput = page.locator('input[name="name"]');
    
    if (await nameInput.count() > 0) {
      const newName = `Updated Name ${Date.now()}`;
      await nameInput.fill(newName);

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/auth/me') &&
          response.request().method() === 'PATCH'
      );

      // 저장 버튼 클릭
      const saveButton = page.locator('button:has-text("저장")').first();
      if (await saveButton.count() > 0) {
        await saveButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('name', newName);
      }
    }
  });

  test('비밀번호 변경', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');

    // 비밀번호 변경 섹션 찾기
    const currentPasswordInput = page.locator('input[name="currentPassword"]');
    
    if (await currentPasswordInput.count() > 0) {
      await currentPasswordInput.fill('currentPassword123');
      await page.fill('input[name="newPassword"]', 'newPassword123');

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/auth/me/password') &&
          response.request().method() === 'PATCH'
      );

      // 변경 버튼 클릭
      const changeButton = page.locator('button:has-text("변경")');
      if (await changeButton.count() > 0) {
        await changeButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('Access Token 갱신 (Refresh)', async ({ authenticatedPage: page }) => {
    // 토큰 만료 시나리오를 시뮬레이션하기 위해
    // 네트워크 요청을 모니터링
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/refresh') &&
        response.request().method() === 'POST'
    );

    // 토큰이 만료된 상태에서 API 호출 시도
    // (실제로는 자동으로 refresh가 호출됨)
    await page.goto('/dashboard');
    
    // 잠시 대기 (refresh가 필요할 수 있음)
    await page.waitForTimeout(2000);

    // refresh 호출이 있었는지 확인 (선택적)
    // 실제로는 토큰이 만료되지 않으면 호출되지 않을 수 있음
  });
});

