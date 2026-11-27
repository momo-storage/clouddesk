import { expect, test, type Page } from '@playwright/test';

/** 모니터링(Phase 4-1) 핵심 동작: 메뉴, 지표·필터, 상세 연동 */

interface StoredResource {
  id: string;
  name: string;
  provider: string;
  status: string;
  monitoringEnabled: boolean;
  cpuUsage: number;
}

async function monitored(page: Page): Promise<StoredResource[]> {
  return page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('clouddesk:data') ?? '{}') as {
      resources: StoredResource[];
    };
    return data.resources.filter((r) => r.status === 'running' && r.monitoringEnabled);
  });
}

async function gotoMonitoring(page: Page) {
  await page.goto('/monitoring');
  await expect(page.getByText(/평균 사용률은/)).toBeVisible();
}

const kpi = (page: Page, label: string) =>
  page
    .getByText(label, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "card")][1]');

test.use({ viewport: { width: 1440, height: 900 } });

test('사이드바 메뉴로 이동하고, CPU 지표는 모니터링 대상 리소스의 현재 평균이다', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '모니터링' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: '모니터링' })).toBeFocused();
  await expect(page.getByText(/평균 사용률은/)).toBeVisible();

  const targets = await monitored(page);
  const average = targets.reduce((sum, r) => sum + r.cpuUsage, 0) / targets.length;
  await expect(kpi(page, 'CPU 사용률')).toContainText(average.toFixed(1));
  await expect(kpi(page, 'CPU 사용률')).toContainText(
    `전체 리소스 ${String(targets.length)}대 평균`,
  );
});

test('제공업체·리소스·기간 필터가 지표와 추이 차트에 함께 반영되고, 목록에서 상세 모니터링 탭으로 이동한다', async ({
  page,
}) => {
  await gotoMonitoring(page);
  const aws = (await monitored(page)).filter((r) => r.provider === 'aws');

  await page.getByRole('combobox', { name: '제공업체' }).selectOption('aws');
  await expect(page.getByRole('combobox', { name: '리소스' }).locator('option')).toHaveCount(
    aws.length + 1,
  );
  await expect(kpi(page, 'CPU 사용률')).toContainText(`AWS 리소스 ${String(aws.length)}대 평균`);

  const target = aws[0];
  await page.getByRole('combobox', { name: '리소스' }).selectOption(target?.id ?? '');
  await page.getByRole('radio', { name: '7일' }).check();
  const trend = page.getByRole('region', { name: '사용률 추이' });
  await expect(trend).toContainText(`${target?.name ?? ''} · 최근 7일 · 2시간 간격`);
  await expect(kpi(page, 'CPU 사용률')).toContainText((target?.cpuUsage ?? 0).toFixed(1));

  const table = page.getByRole('table', { name: '사용률 상위 리소스' });
  const first = table.locator('tbody a').first();
  const name = (await first.textContent()) ?? '';
  await first.click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeFocused();
  await expect(page).toHaveURL(/\?tab=monitoring$/);
});
