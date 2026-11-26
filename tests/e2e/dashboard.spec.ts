import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * 대시보드(Phase 3-1). 수치가 저장된 데이터에서 계산되는지, 차트 대체 정보·이동 인터랙션·접근성을 확인한다.
 */

const STORAGE_KEY = 'clouddesk:data';

interface StoredResource {
  id: string;
  name: string;
  status: string;
  cpuUsage: number;
}

async function storedResources(page: Page): Promise<StoredResource[]> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { resources: StoredResource[] }).resources : [];
  }, STORAGE_KEY);
}

/** 차트·비용까지 모두 불러올 때까지 기다린다. */
async function gotoDashboard(page: Page) {
  await page.goto('/dashboard');
  await expect(page.getByText(/최근 24시간 평균 사용률은/)).toBeVisible();
  await expect(page.getByText(/최근 6개월 비용은/)).toBeVisible();
}

/** 요약 지표 카드: 라벨이 들어 있는 카드 요소 */
const kpi = (page: Page, label: string) =>
  page
    .getByText(label, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "card")][1]');

test.use({ viewport: { width: 1440, height: 900 } });

test('요약 지표는 저장된 리소스에서 계산된다(하드코딩이 아님)', async ({ page }) => {
  await gotoDashboard(page);
  const resources = await storedResources(page);
  const count = (status: string) => resources.filter((r) => r.status === status).length;

  await expect(kpi(page, '전체 리소스')).toContainText(`${String(resources.length)}대`);
  await expect(kpi(page, '실행 중')).toContainText(`${String(count('running'))}대`);
  await expect(kpi(page, '중지됨')).toContainText(`${String(count('stopped'))}대`);
  await expect(kpi(page, '이번 달 비용')).toContainText('$');

  // 저장 데이터에서 실행 중 리소스 하나를 지우고 다시 열면 지표가 함께 바뀐다.
  const removed = resources.find((r) => r.status === 'running');
  await page.evaluate(
    ([key, id]) => {
      const data = JSON.parse(window.localStorage.getItem(key) ?? '{}') as {
        resources: { id: string }[];
      };
      data.resources = data.resources.filter((r) => r.id !== id);
      window.localStorage.setItem(key, JSON.stringify(data));
    },
    [STORAGE_KEY, removed?.id ?? ''] as const,
  );
  await gotoDashboard(page);
  await expect(kpi(page, '전체 리소스')).toContainText(`${String(resources.length - 1)}대`);
  await expect(kpi(page, '실행 중')).toContainText(`${String(count('running') - 1)}대`);
  await expect(
    page.getByText(`실행 중 리소스 ${String(count('running') - 1)}대 평균`),
  ).toBeVisible();
});

test('주요 리소스 상태는 CPU 사용률 상위 5개를 보여주고 상세 화면으로 이동한다', async ({
  page,
}) => {
  await gotoDashboard(page);
  const top = [...(await storedResources(page))].sort((a, b) => b.cpuUsage - a.cpuUsage)[0];

  const table = page.getByRole('table', { name: 'CPU 사용률 상위 리소스' });
  await expect(table.getByRole('row')).toHaveCount(6);
  const link = table.getByRole('link', { name: top?.name ?? '' });
  await link.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(new RegExp(`/resources/${top?.id ?? ''}$`));
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('오류 상태 리소스는 요약 지표에서 강조되고 오류 목록으로 이동한다', async ({ page }) => {
  await gotoDashboard(page);
  const errors = (await storedResources(page)).filter((r) => r.status === 'error').length;
  const alert = page.getByRole('link', { name: `오류 상태 ${String(errors)}대 확인 필요` });
  await expect(alert).toBeVisible();
  await alert.click();
  await expect(page).toHaveURL(/\/resources\?status=error$/);
});

test('375px: 넓은 표는 가로 스크롤 안내를 보여주고 스크롤 영역의 설명으로 연결한다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await gotoDashboard(page);
  const region = page.getByRole('region', { name: 'CPU 사용률 상위 리소스' });
  await expect(region).toHaveAccessibleDescription(
    '표를 좌우로 스크롤하면 모든 열을 볼 수 있습니다.',
  );
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('1440px: 표가 영역 안에 들어가면 스크롤 안내를 보여주지 않는다', async ({ page }) => {
  await gotoDashboard(page);
  const region = page.getByRole('region', { name: 'CPU 사용률 상위 리소스' });
  await expect(region).not.toHaveAttribute('aria-describedby');
});

test('요약 지표 카드의 링크는 해당 목록으로 이동한다', async ({ page }) => {
  await gotoDashboard(page);
  await page.getByRole('link', { name: '실행 중 리소스 보기' }).click();
  await expect(page).toHaveURL(/\/resources\?status=running$/);
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
});

test('최근 이벤트는 최신 8건이며 리소스 이름으로 상세 화면에 갈 수 있다', async ({ page }) => {
  await gotoDashboard(page);
  const table = page.getByRole('table', { name: '최근 알림 및 이벤트' });
  await expect(table.getByRole('row')).toHaveCount(9);
  await expect(table.getByRole('row').nth(1).getByRole('link')).toHaveAttribute(
    'href',
    /^\/resources\//,
  );
});

test('모든 차트는 요약 문장과 펼칠 수 있는 대체 데이터 표를 제공한다', async ({ page }) => {
  await gotoDashboard(page);

  const summaries = page.getByText('데이터 표로 보기');
  await expect(summaries).toHaveCount(3);
  for (const summary of await summaries.all()) await summary.click();

  await expect(
    page
      .getByRole('table', { name: '실행 중 리소스 평균 CPU·메모리 사용률(최근 24시간)' })
      .getByRole('row'),
  ).toHaveCount(49);
  await expect(
    page.getByRole('table', { name: '제공업체별 상태별 리소스 수' }).getByRole('row'),
  ).toHaveCount(4);
  await expect(
    page.getByRole('table', { name: '월별 제공업체별 비용(최근 6개월)' }).getByRole('row'),
  ).toHaveCount(7);

  // 차트 그림은 낭독기에서 숨긴다(같은 정보는 표로 제공).
  const hiddenCharts = await page.locator('[aria-hidden="true"] .recharts-surface').count();
  expect(hiddenCharts).toBe(3);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('대시보드 지연 로딩: 처음 열 때 콘솔 경고·오류가 없다', async ({ page }) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));
  await gotoDashboard(page);
  expect(issues).toEqual([]);
});

for (const width of [1920, 1024, 375]) {
  test(`${String(width)}px: 페이지 전체 가로 스크롤이 없다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoDashboard(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
