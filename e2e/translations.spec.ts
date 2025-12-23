import { test, expect } from './fixtures/auth';

test.describe('번역 관리 (Translations)', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // 프로젝트가 필요하므로 대시보드에서 첫 번째 프로젝트로 이동
    await page.goto('/dashboard');
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);
    }
  });

  test('번역 매트릭스 조회', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/projects/${projectId}/translations/matrix`) &&
          response.request().method() === 'GET'
      );

      await page.reload();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('locales');
      expect(data).toHaveProperty('rows');
    }
  });

  test('번역 키 추가', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // 새 키 추가 버튼 클릭
      const addButton = page.locator('button:has-text("새 번역 키 추가")');
      
      if (await addButton.count() > 0) {
        await addButton.click();

        // 폼 작성
        const keyName = `test.key.${Date.now()}`;
        await page.fill('input[placeholder*="키 이름"]', keyName);

        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/projects/${projectId}/keys`) &&
            response.request().method() === 'POST'
        );

        // Enter 키로 저장
        await page.press('input[placeholder*="키 이름"]', 'Enter');

        const response = await responsePromise;
        expect(response.status()).toBe(201);
      }
    }
  });

  test('번역 값 편집 및 저장', async ({ authenticatedPage: page }) => {
    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
    
    if (projectId) {
      await page.goto(`/projects/${projectId}/translations`);

      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 10000 });

      // 첫 번째 편집 가능한 셀 찾기
      const editableCell = page.locator('td[data-editable="true"]').first();
      
      if (await editableCell.count() > 0) {
        // 셀 더블클릭하여 편집 모드로 전환
        await editableCell.dblclick();

        // 값 입력
        const input = page.locator('input, textarea').first();
        await input.fill('Test Translation');

        // Enter 키로 저장
        await input.press('Enter');

        // 저장 버튼 클릭
        const saveButton = page.locator('button:has-text("저장")');
        
        if (await saveButton.count() > 0) {
          // API 호출 확인
          const responsePromise = page.waitForResponse(
            (response) =>
              response.url().includes(`/projects/${projectId}/translations`) &&
              response.request().method() === 'PATCH'
          );

          await saveButton.click();

          const response = await responsePromise;
          expect(response.status()).toBe(200);
        }
      }
    }
  });
});

