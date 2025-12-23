import { test, expect } from './fixtures/auth';

test.describe('언어 관리 확장 (Locales Extended)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);
    }
  });

  test('언어 삭제', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/locales`);

      // 기본 언어가 아닌 첫 번째 언어의 삭제 버튼 찾기
      const deleteButton = page.locator('button:has-text("삭제")').first();
      
      if (await deleteButton.count() > 0) {
        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/projects/${projectId}/locales/`) &&
            response.url().match(/\/locales\/[^/]+$/) &&
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

