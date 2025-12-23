import { test, expect } from './fixtures/auth';

test.describe('번역 키 관리 (Keys)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);
    }
  });

  test('번역 키 목록 조회', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/projects/${projectId}/keys`) &&
          response.request().method() === 'GET'
      );

      await page.reload();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  test('번역 키 수정', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 10000 });

      // 첫 번째 키의 편집 버튼 찾기
      const editButton = page.locator('button[aria-label*="편집"], button[aria-label*="수정"]').first();
      
      if (await editButton.count() > 0) {
        await editButton.click();

        // 키 이름 수정
        const keyInput = page.locator('input[value*="."]').first();
        if (await keyInput.count() > 0) {
          const newKeyName = `updated.key.${Date.now()}`;
          await keyInput.fill(newKeyName);

          // API 호출 확인
          const responsePromise = page.waitForResponse(
            (response) =>
              response.url().includes(`/projects/${projectId}/keys/`) &&
              response.url().includes('/keys/') &&
              response.request().method() === 'PATCH'
          );

          // 저장 버튼 클릭
          await page.press('input[value*="."]', 'Enter');

          const response = await responsePromise;
          expect(response.status()).toBe(200);
        }
      }
    }
  });

  test('번역 키 삭제', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 10000 });

      // 첫 번째 키의 삭제 버튼 찾기
      const deleteButton = page.locator('button[aria-label*="삭제"]').first();
      
      if (await deleteButton.count() > 0) {
        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/projects/${projectId}/keys/`) &&
            response.url().includes('/keys/') &&
            response.request().method() === 'DELETE'
        );

        await deleteButton.click();

        // 확인 다이얼로그
        const confirmButton = page.locator('button:has-text("삭제")').last();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();

          const response = await responsePromise;
          expect(response.status()).toBe(200);
        }
      }
    }
  });
});

