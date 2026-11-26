import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * 환경 검증용 스모크 테스트.
 * 빌드 결과가 렌더링되는지, 콘솔 오류가 없는지, axe 자동 검사(WCAG 2.2 AA 태그)가 통과하는지 확인한다.
 * axe 통과는 자동 검사 가능한 항목에 한정되며, 접근성 준수 여부를 확정하지 않는다.
 */
test('첫 화면이 오류 없이 렌더링된다', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('CloudDesk');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.getByRole('heading', { level: 1, name: 'CloudDesk' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('첫 화면에 axe 자동 검사 위반이 없다', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
