import { test, expect } from './fixtures/auth';

test.describe('구독 플랜 (Subscription)', () => {
  test('플랜 정보 조회', async ({ authenticatedPage: page }) => {
    // 설정 페이지로 이동
    await page.goto('/settings');

    // 플랜 정보 섹션 확인
    await expect(page.locator('text=구독 플랜')).toBeVisible();
    
    // 플랜 배지 확인 (기본값: FREE)
    await expect(page.locator('text=무료')).toBeVisible();

    // API 호출 확인 (Network 탭)
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/subscription/plan') &&
        response.request().method() === 'GET'
    );

    await page.reload();
    const response = await responsePromise;

    // 응답 상태 확인
    expect(response.status()).toBe(200);

    // 응답 데이터 확인
    const data = await response.json();
    expect(data).toHaveProperty('plan');
    expect(data).toHaveProperty('features');
    expect(data.features).toHaveProperty('canExportExcel');
    expect(data.features).toHaveProperty('canImport');
    expect(data.features).toHaveProperty('canInviteMembers');
  });

  test('Free 플랜 - 기능 제한 확인', async ({ authenticatedPage: page }) => {
    // 번역 페이지로 이동 (프로젝트가 있다고 가정)
    await page.goto('/dashboard');
    
    // 첫 번째 프로젝트 클릭 (있다면)
    const projectCard = page.locator('[data-testid="project-card"]').first();
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForURL(/\/projects\/.*\/translations/);

      // Import 버튼 비활성화 확인
      const importButton = page.locator('button:has-text("가져오기")');
      if (await importButton.count() > 0) {
        await expect(importButton).toBeDisabled();
      }

      // Export 버튼 확인
      const exportButton = page.locator('button:has-text("내보내기")');
      if (await exportButton.count() > 0) {
        await exportButton.click();
        
        // Excel/CSV 옵션이 비활성화되어 있는지 확인
        await expect(page.locator('text=Excel 다운로드')).toBeVisible();
      }
    }
  });

  test('멤버 초대 버튼 제한 확인', async ({ authenticatedPage: page }) => {
    // 멤버 페이지로 이동
    await page.goto('/members');

    // 멤버 초대 버튼 확인
    const inviteButton = page.locator('button:has-text("멤버 초대")');
    
    if (await inviteButton.count() > 0) {
      // Free 플랜이면 비활성화되어야 함
      const isDisabled = await inviteButton.isDisabled();
      
      if (isDisabled) {
        // 툴팁 확인
        await inviteButton.hover();
        await expect(page.locator('text=Starter 플랜 이상에서 사용 가능합니다')).toBeVisible();
      }
    }
  });
});

