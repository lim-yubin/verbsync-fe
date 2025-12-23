import { test, expect } from './fixtures/auth';

test.describe('프로젝트 확장 (Projects Extended)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);
    }
  });

  test('API Key 조회', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      // 프로젝트 상세 페이지에서 API Key 섹션 확인
      await page.goto(`/projects/${projectId}`);

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/projects/${projectId}/api-key`) &&
          response.request().method() === 'GET'
      );

      await page.reload();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('apiKey');
    }
  });

  test('프로젝트 수정', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/settings`);

      // 프로젝트 이름 수정
      const nameInput = page.locator('input[name="name"]');
      
      if (await nameInput.count() > 0) {
        const newName = `Updated Project ${Date.now()}`;
        await nameInput.fill(newName);

        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/projects/${projectId}`) &&
            response.request().method() === 'PATCH'
        );

        // 저장 버튼 클릭
        const saveButton = page.locator('button:has-text("저장")');
        if (await saveButton.count() > 0) {
          await saveButton.click();

          const response = await responsePromise;
          expect(response.status()).toBe(200);

          const data = await response.json();
          expect(data).toHaveProperty('name', newName);
        }
      }
    }
  });
});

