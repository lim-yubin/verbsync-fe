import { test as base, expect } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: any;
};

/**
 * 인증된 사용자로 테스트하기 위한 fixture
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, baseURL }, use) => {
    // 테스트용 계정 정보 (환경변수 또는 기본값)
    const testEmail = process.env.TEST_EMAIL || `test-${Date.now()}@example.com`;
    const testPassword = process.env.TEST_PASSWORD || 'test123456';
    const testName = 'Test User';

    // 먼저 로그인 시도
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input#email', testEmail);
    await page.fill('input#password', testPassword);
    
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');
    const loginResponse = await loginResponsePromise;

    // 로그인 실패 시 회원가입 시도
    if (loginResponse.status() === 401) {
      // 회원가입 페이지로 이동
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // API 응답 대기 설정 (버튼 클릭 전에)
      const registerResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/auth/register') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );

      await page.fill('input#name', testName);
      await page.fill('input#email', testEmail);
      await page.fill('input#password', testPassword);
      await page.fill('input[name="passwordConfirm"]', testPassword);

      await page.click('button[type="submit"]');
      const registerResponse = await registerResponsePromise;

      if (registerResponse.status() !== 201) {
        const errorText = await registerResponse.text();
        throw new Error(`Registration failed: ${registerResponse.status()} - ${errorText}`);
      }

      // 회원가입 성공 후 대시보드로 리다이렉트 대기
      await page.waitForURL('/dashboard', { timeout: 15000 });
    } else if (loginResponse.status() === 200) {
      // 로그인 성공 시 대시보드로 리다이렉트 대기
      await page.waitForURL('/dashboard', { timeout: 15000 });
    } else {
      // 다른 에러
      const errorText = await loginResponse.text();
      if (loginResponse.status() === 500) {
        console.warn('백엔드 서버에서 500 에러가 발생했습니다. 서버를 재시작해주세요.');
        console.warn(`에러 내용: ${errorText}`);
      }
      throw new Error(`Login failed: ${loginResponse.status()} - ${errorText}`);
    }

    // 인증된 페이지 사용
    await use(page);
  },
});

export { expect };

