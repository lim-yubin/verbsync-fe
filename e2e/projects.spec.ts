import { test, expect } from './fixtures/auth';

test.describe('프로젝트 관리 (Projects)', () => {
  test('프로젝트 목록 조회', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/projects') &&
        response.request().method() === 'GET' &&
        !response.url().includes('/projects/')
    );

    await page.reload();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('프로젝트 생성', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 새 프로젝트 버튼 클릭
    await page.click('button:has-text("새 프로젝트")');

    // 다이얼로그가 열릴 때까지 대기
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 폼 작성
    const projectName = `Test Project ${Date.now()}`;
    await page.fill('input[name="name"]', projectName);
    
    // Select 컴포넌트 처리 (기본값이 "en"이므로 변경 불필요하지만, 명시적으로 설정)
    const selectButton = page.locator('button[role="combobox"]');
    if (await selectButton.count() > 0) {
      await selectButton.click();
      // SelectContent가 나타날 때까지 대기
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      // 첫 번째 옵션 선택 (또는 "en" 옵션)
      await page.locator('[role="option"]').first().click();
    }

    // API 호출 확인
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/projects') &&
        response.request().method() === 'POST'
    );

    // 생성 버튼 클릭
    await page.locator('button:has-text("생성")').click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', projectName);
  });

  test('프로젝트 상세 조회', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // 첫 번째 프로젝트 클릭
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      // API 호출 확인
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().match(/\/projects\/[^/]+$/) &&
          response.request().method() === 'GET'
      );

      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);

      const response = await responsePromise;
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
    }
  });

  test('프로젝트 삭제', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // 프로젝트가 있는 경우에만 테스트
    const projectCard = page.locator('[data-testid="project-card"]').first();
    
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/[^/]+$/);

      // 설정 페이지로 이동
      await page.goto(page.url().replace(/\/projects\/[^/]+$/, '/projects/$1/settings'));

      // 삭제 버튼 클릭
      const deleteButton = page.locator('button:has-text("삭제")');
      
      if (await deleteButton.count() > 0) {
        // API 호출 확인
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().match(/\/projects\/[^/]+$/) &&
            response.request().method() === 'DELETE'
        );

        await deleteButton.click();
        
        // 확인 다이얼로그
        await page.click('button:has-text("삭제")', { timeout: 5000 });

        const response = await responsePromise;
        expect(response.status()).toBe(200);
      }
    }
  });
});

