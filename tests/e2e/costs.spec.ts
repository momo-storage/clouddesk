import { expect, test, type Page } from '@playwright/test';

/** 비용 관리(Phase 4-2) 핵심 동작: 메뉴, 대시보드와 같은 이번 달 비용, 제공업체·기간 필터 */

const kpi = (page: Page, label: string) =>
  page
    .getByText(label, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "card")][1]');

const amountOf = async (page: Page, label: string) =>
  (await kpi(page, label).innerText()).match(/\$[\d,]+\.\d{2}/)?.[0] ?? '';

test.use({ viewport: { width: 1440, height: 900 } });

test('사이드바 메뉴로 이동하고, 이번 달 비용은 대시보드와 같다', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText(/최근 6개월 비용은/)).toBeVisible();
  const dashboardTotal = await amountOf(page, '이번 달 비용');

  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '비용 관리' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: '비용 관리' })).toBeFocused();
  await expect(page.getByText(/동안 월 비용은/)).toBeVisible();
  expect(await amountOf(page, '이번 달 비용')).toBe(dashboardTotal);
});

test('제공업체·조회 기간 필터가 지표·추이 차트·서비스 유형별 내역에 반영된다', async ({ page }) => {
  await page.goto('/costs');
  await expect(page.getByText(/최근 6개월 동안 월 비용은/)).toBeVisible();
  const allTotal = await amountOf(page, '이번 달 비용');
  await expect(
    page.getByRole('table', { name: '제공업체별 비용 내역' }).locator('tbody tr'),
  ).toHaveCount(3);

  await page.getByRole('combobox', { name: '제공업체' }).selectOption('aws');
  await page.getByRole('combobox', { name: '조회 기간' }).selectOption('12');
  await expect(page.getByText(/최근 12개월 동안 월 비용은/)).toBeVisible();
  expect(await amountOf(page, '이번 달 비용')).not.toBe(allTotal);
  await expect(kpi(page, '최근 12개월 합계')).toBeVisible();

  // 제공업체를 고르면 제공업체별 비중 표는 숨기고, 서비스 유형에 실제 서비스명을 함께 보여준다.
  await expect(page.getByRole('table', { name: '제공업체별 비용 내역' })).toHaveCount(0);
  const services = page.getByRole('table', { name: '서비스 유형별 비용 내역' });
  await expect(services.locator('tbody tr')).toHaveCount(5);
  await expect(services).toContainText('Amazon EC2');

  const chart = page.getByRole('region', { name: '월별 비용 추이' });
  await chart.getByText('데이터 표로 보기').click();
  await expect(chart.getByRole('table').locator('tbody tr')).toHaveCount(12);
});
