import { test, expect } from './fixtures/auth';

test.describe('언어 관리 (Locales)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // 프로젝트가 필요하므로 대시보드에서 첫 번째 프로젝트로 이동
    await page.goto('/dashboard');
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);
    }
  });

  test('언어 목록 조회', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/locales`);

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/projects/${projectId}/locales`) &&
          response.request().method() === 'GET'
      );

      await page.reload();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  test('언어 추가', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/locales`);

      // 언어 추가 버튼 클릭
      const addButton = page.locator('button:has-text("언어 추가")');
      
      if (await addButton.count() > 0) {
        await addButton.click();

        // 다이얼로그 확인
        await expect(page.locator('text=언어 추가')).toBeVisible();

        // 폼 작성
        await page.fill('input[name="code"]', 'ja');
        await page.fill('input[name="name"]', '日本語');

        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/projects/${projectId}/locales`) &&
            response.request().method() === 'POST'
        );

        // 생성 버튼 클릭
        await page.click('button:has-text("추가")');

        const response = await responsePromise;
        expect(response.status()).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('code', 'ja');
      }
    }
  });

  test('언어 활성화/비활성화', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/locales`);

      // 첫 번째 언어의 토글 스위치 찾기
      const toggle = page.locator('input[type="checkbox"]').first();
      
      if (await toggle.count() > 0) {
        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/locales') &&
            response.url().includes('/status') &&
            response.request().method() === 'PATCH'
        );

        await toggle.click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
      }
    }
  });
});

