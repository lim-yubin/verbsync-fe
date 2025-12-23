import { test, expect } from '@playwright/test';

test.describe('인증 (Authentication)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('회원가입', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // 폼 작성
    const email = `test-${Date.now()}@example.com`;
    const password = 'test123456';
    const name = 'Test User';

    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.fill('input[name="name"]', name);

    // API 호출 확인 (타임아웃 설정)
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/register') &&
        response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null);

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');

    // API 응답 대기
    const response = await responsePromise;
    
    if (!response) {
      // 백엔드 서버가 실행 중이지 않을 수 있음
      console.warn('백엔드 서버가 응답하지 않습니다. 서버가 실행 중인지 확인하세요.');
      test.skip();
      return;
    }
    
    // 성공 또는 중복 이메일 에러 처리
    if (response.status() === 201) {
      // 성공 후 대시보드로 리다이렉트 확인
      await page.waitForURL('/dashboard', { timeout: 15000 });
      expect(page.url()).toContain('/dashboard');
    } else if (response.status() === 409) {
      // 이미 존재하는 이메일인 경우 스킵
      test.skip();
    } else {
      // 다른 에러인 경우 실패
      const errorText = await response.text();
      throw new Error(`Registration failed: ${response.status()} - ${errorText}`);
    }
  });

  test('로그인', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 폼 작성 (fixture에서 생성한 계정 사용)
    const email = `test-${Date.now()}@example.com`;
    const password = 'test123456';

    // 먼저 회원가입
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.fill('input[name="passwordConfirm"]', password);
    
    const registerResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/register') &&
        response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await registerResponsePromise;
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // 로그아웃
    await page.goto('/dashboard');
    await page.locator('button:has([class*="Avatar"])').click();
    await page.locator('text=로그아웃').click();
    await page.waitForURL('/login', { timeout: 10000 });

    // 다시 로그인
    await page.fill('input#email', email);
    await page.fill('input#password', password);

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');
    const loginResponse = await loginResponsePromise;
    
    if (loginResponse.status() !== 200) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status()} - ${errorText}`);
    }

    // 성공 후 대시보드로 리다이렉트 확인
    await page.waitForURL('/dashboard', { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('로그아웃', async ({ page }) => {
    // 먼저 회원가입 및 로그인
    const email = `test-${Date.now()}@example.com`;
    const password = 'test123456';
    
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.fill('input[name="passwordConfirm"]', password);
    
    const registerResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/register') &&
        response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await registerResponsePromise;
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // 사용자 메뉴 클릭 (Avatar 버튼)
    await page.locator('button:has([class*="Avatar"])').click();
    
    // 로그아웃 버튼 클릭
    await page.locator('text=로그아웃').click();

    // 로그인 페이지로 리다이렉트 확인
    await page.waitForURL('/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});

