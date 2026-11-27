import { expect, test, type Page } from '@playwright/test';

/**
 * 리소스 상세(Phase 3-3). 목록과 같은 데이터를 쓰는지, 탭·기간·필터, 수정·삭제 반영, 없는 리소스 처리를 확인한다.
 */

const STORAGE_KEY = 'clouddesk:data';

interface StoredResource {
  id: string;
  name: string;
  os: string;
  region: string;
  network: string;
  subnet: string;
  status: string;
}

interface StoredEvent {
  resourceId: string;
  severity: string;
}

async function stored(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw
      ? (JSON.parse(raw) as { resources: StoredResource[]; events: StoredEvent[] })
      : { resources: [], events: [] };
  }, STORAGE_KEY);
}

/** 이벤트가 2건 이상이고 심각도가 섞인 실행 중 리소스를 고른다(탭·필터 확인용). */
async function pickResource(page: Page): Promise<StoredResource> {
  await page.goto('/resources');
  await expect(page.getByRole('status').filter({ hasText: /전체 \d+개/ })).toBeVisible();
  const data = await stored(page);
  const candidate = data.resources.find((resource) => {
    const events = data.events.filter((event) => event.resourceId === resource.id);
    return resource.status === 'running' && new Set(events.map((e) => e.severity)).size >= 2;
  });
  if (!candidate) throw new Error('조건에 맞는 리소스가 없습니다.');
  return candidate;
}

async function gotoDetail(page: Page, resource: StoredResource, search = '') {
  await page.goto(`/resources/${resource.id}${search}`);
  await expect(page.getByRole('heading', { level: 1, name: resource.name })).toBeVisible();
}

const tab = (page: Page, name: RegExp | string) =>
  page.getByRole('tablist', { name: '리소스 상세 정보' }).getByRole('tab', { name });

test.use({ viewport: { width: 1440, height: 900 } });

test('목록에서 상세로 이동하면 리소스명이 제목·Breadcrumb·문서 제목이 되고, 목록으로 돌아갈 수 있다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  await page.getByRole('searchbox', { name: '검색어' }).fill(resource.name);
  await page.getByRole('searchbox', { name: '검색어' }).press('Enter');
  await page.getByRole('link', { name: resource.name, exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/resources/${resource.id}$`));
  await expect(page.getByRole('heading', { level: 1, name: resource.name })).toBeFocused();
  await expect(page).toHaveTitle(`${resource.name} | CloudDesk`);
  const breadcrumb = page.getByRole('navigation', { name: '경로' });
  await expect(breadcrumb.getByText(resource.name)).toHaveAttribute('aria-current', 'page');

  // 개요: 목록에서 뺀 보조 정보(OS·지역명·사양)를 보여준다.
  const basic = page.getByRole('region', { name: '기본 정보' });
  await expect(basic).toContainText(resource.id);
  await expect(basic).toContainText(resource.os);
  await expect(basic).toContainText(resource.region);
  await expect(basic).toContainText(/vCPU \d+개 · 메모리 \d+ GiB/);

  await breadcrumb.getByRole('link', { name: '리소스 관리' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
});

test('탭은 주소(?tab=)와 동기화되고, 새로고침해도 유지되며 잘못된 값은 개요로 연다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  await gotoDetail(page, resource);
  await expect(tab(page, '개요')).toHaveAttribute('aria-selected', 'true');

  await tab(page, '네트워크').click();
  await expect(page).toHaveURL(/\?tab=network$/);
  // 같은 경로의 쿼리 변경이라 초점은 선택한 탭에 남는다.
  await expect(tab(page, '네트워크')).toBeFocused();
  await page.reload();
  await expect(tab(page, '네트워크')).toHaveAttribute('aria-selected', 'true');

  await tab(page, '네트워크').press('ArrowLeft');
  await expect(page).toHaveURL(/\?tab=monitoring$/);
  await tab(page, '모니터링').press('Home');
  await expect(page).toHaveURL(new RegExp(`/resources/${resource.id}$`));

  await gotoDetail(page, resource, '?tab=unknown');
  await expect(tab(page, '개요')).toHaveAttribute('aria-selected', 'true');
});

test('모니터링: CPU·메모리와 디스크 차트가 따로 있고, 조회 기간을 바꾸면 두 차트에 함께 반영된다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  await gotoDetail(page, resource, '?tab=monitoring');
  const usage = page.getByRole('region', { name: 'CPU·메모리 사용률' });
  const disk = page.getByRole('region', { name: '디스크 사용률' });
  await expect(usage).toContainText('최근 24시간 · 30분 간격');
  await expect(disk).toContainText('최근 24시간 · 30분 간격');
  await expect(usage.getByText(/최근 24시간 평균 사용률은/)).toBeVisible();
  await expect(disk.getByText(/최근 24시간 디스크 사용률은/)).toBeVisible();

  const counts: Record<string, number> = { '1시간': 12, '7일': 84 };
  for (const [label, points] of Object.entries(counts)) {
    await page.getByRole('radio', { name: label }).check();
    for (const panel of [usage, disk]) {
      await expect(panel).toContainText(`최근 ${label}`);
      await panel.getByText('데이터 표로 보기').click();
      // 머리글 1행 + 시점 수(두 차트가 같은 시점을 쓴다)
      await expect(panel.getByRole('table').getByRole('row')).toHaveCount(points + 1);
      await panel.getByText('데이터 표로 보기').click();
    }
  }
});

test('개요: 현재 사용률 막대는 카드 너비를 채우고, 목록 표의 막대 크기는 그대로다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  const listTrack = await page
    .getByRole('table', { name: '가상 서버 리소스' })
    .locator('tbody tr:first-child td:nth-child(9) span[aria-hidden="true"]')
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(listTrack).toBe(56);

  await gotoDetail(page, resource);
  const panel = page.getByRole('region', { name: '현재 사용률' });
  await expect(panel.getByRole('listitem')).toHaveCount(3);
  await expect(panel.getByRole('listitem').first()).toContainText('CPU');
  const panelWidth = await panel.evaluate((el) => el.getBoundingClientRect().width);
  const trackWidth = await panel
    .getByRole('listitem')
    .first()
    .locator('span[aria-hidden="true"]')
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(trackWidth).toBeGreaterThan(panelWidth * 0.8);
});

test('목록에서 들어온 상세는 Breadcrumb·삭제 후 같은 목록 조건으로 돌아가고, 직접 들어오면 기본 목록으로 간다', async ({
  page,
}) => {
  const listSearch = '?provider=aws&sort=name&order=asc&page=2&size=10';
  await page.goto(`/resources${listSearch}`);
  await expect(page.getByRole('status').filter({ hasText: /전체 \d+개/ })).toBeVisible();
  const table = page.getByRole('table', { name: '가상 서버 리소스' });
  const firstName = (await table.locator('tbody a').first().textContent()) ?? '';
  await table.locator('tbody a').first().click();
  await expect(page.getByRole('heading', { level: 1, name: firstName })).toBeVisible();

  // 탭을 바꿔도 돌아갈 조건이 유지된다.
  await tab(page, '네트워크').click();
  await expect(page).toHaveURL(/\?tab=network$/);
  const breadcrumbLink = page
    .getByRole('navigation', { name: '경로' })
    .getByRole('link', { name: '리소스 관리' });
  await expect(breadcrumbLink).toHaveAttribute('href', `/resources${listSearch}`);
  await breadcrumbLink.click();
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
  expect(new URL(page.url()).search).toBe(listSearch);
  await expect(page.getByRole('combobox', { name: '제공업체' })).toHaveValue('aws');
  await expect(page.getByRole('combobox', { name: '페이지당 행 수' })).toHaveValue('10');
  await expect(page.getByRole('button', { name: '2 페이지' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // 삭제 후에도 같은 조건의 목록으로 돌아간다.
  await table.locator('tbody a').first().click();
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await page
    .getByRole('dialog', { name: '리소스 삭제' })
    .getByRole('button', { name: '삭제' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
  expect(new URL(page.url()).search).toBe(listSearch);

  // 상세 주소로 바로 들어오면 기본 목록으로 돌아간다.
  const resource = await pickResource(page);
  await gotoDetail(page, resource);
  await expect(
    page.getByRole('navigation', { name: '경로' }).getByRole('link', { name: '리소스 관리' }),
  ).toHaveAttribute('href', '/resources');
});

test('네트워크: VPC/VNet·서브넷과 인바운드 보안 규칙을 보여준다', async ({ page }) => {
  const resource = await pickResource(page);
  await gotoDetail(page, resource, '?tab=network');
  const config = page.getByRole('region', { name: '네트워크 구성' });
  await expect(config).toContainText(resource.network);
  await expect(config).toContainText(resource.subnet);
  const rules = page.getByRole('table', { name: '인바운드 보안 규칙' });
  await expect(rules.getByRole('row')).toHaveCount(4);
});

test('이벤트 로그: 이 리소스의 이벤트만 최신순으로 보여주고 심각도로 거른다', async ({ page }) => {
  const resource = await pickResource(page);
  const events = (await stored(page)).events.filter((event) => event.resourceId === resource.id);
  await gotoDetail(page, resource, '?tab=events');

  const log = page.getByRole('table', { name: '이벤트 로그' });
  await expect(log.locator('tbody tr')).toHaveCount(events.length);
  await expect(tab(page, `이벤트 로그 (${String(events.length)})`)).toBeVisible();

  const warnings = events.filter((event) => event.severity === 'warning').length;
  await page.getByRole('combobox', { name: '심각도' }).selectOption('warning');
  await expect(page.getByRole('status').filter({ hasText: '경고' })).toHaveText(
    `경고 ${String(warnings)}건 · 전체 ${String(events.length)}건`,
  );
  if (warnings > 0) await expect(log.locator('tbody tr')).toHaveCount(warnings);
  else await expect(page.getByText('선택한 심각도의 이벤트가 없습니다.')).toBeVisible();
});

test('상세에서 수정하면 제목·Breadcrumb·목록에 바로 반영되고, 모니터링 수집을 끄면 기록 없음 안내를 보여준다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  await gotoDetail(page, resource);
  const editButton = page.getByRole('button', { name: '수정', exact: true });
  await editButton.click();

  const dialog = page.getByRole('dialog', { name: '리소스 수정' });
  const renamed = `${resource.name}-x`;
  await dialog.getByRole('textbox', { name: '리소스명' }).fill(renamed);
  // 스위치 input은 시각적으로 숨겨져 있어 라벨을 누른다(실제 사용자 조작과 같다).
  const monitoring = dialog.getByRole('switch', { name: '모니터링 수집' });
  await dialog.getByText('모니터링 수집').click();
  await expect(monitoring).not.toBeChecked();
  await dialog.getByRole('button', { name: '저장' }).click();

  await expect(dialog).toBeHidden();
  await expect(editButton).toBeFocused();
  await expect(page.getByRole('heading', { level: 1, name: renamed })).toBeVisible();
  await expect(page).toHaveTitle(`${renamed} | CloudDesk`);
  await expect(page.getByText(`'${renamed}' 리소스 정보를 수정했습니다.`)).toBeVisible();

  await tab(page, '모니터링').click();
  await expect(page.getByText(/모니터링 수집이 꺼져 있어/)).toBeVisible();

  // 수정 이벤트가 이벤트 로그에 추가된다.
  await tab(page, /이벤트 로그/).click();
  await expect(page.getByRole('table', { name: '이벤트 로그' })).toContainText(
    '리소스 정보가 수정되었습니다.',
  );

  await page
    .getByRole('navigation', { name: '경로' })
    .getByRole('link', { name: '리소스 관리' })
    .click();
  // 목록에서도 바뀐 이름으로 찾을 수 있다(첫 페이지에 없을 수 있어 검색한다).
  await page.getByRole('searchbox', { name: '검색어' }).fill(renamed);
  await page.getByRole('searchbox', { name: '검색어' }).press('Enter');
  await expect(page.getByRole('link', { name: renamed, exact: true })).toBeVisible();
});

test('상세에서 삭제하면 목록으로 이동하고, 같은 주소는 찾을 수 없음 상태가 된다', async ({
  page,
}) => {
  const resource = await pickResource(page);
  await gotoDetail(page, resource);
  await page.getByRole('button', { name: '삭제', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: '리소스 삭제' });
  await expect(dialog).toContainText(resource.name);
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();
  await dialog.getByRole('button', { name: '삭제' }).click();

  await expect(page).toHaveURL(/\/resources$/);
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
  await expect(page.getByText(`'${resource.name}' 리소스를 삭제했습니다.`)).toBeVisible();
  await expect(page.getByRole('link', { name: resource.name, exact: true })).toHaveCount(0);

  await page.goto(`/resources/${resource.id}`);
  await expect(
    page.getByRole('heading', { level: 1, name: '리소스를 찾을 수 없습니다' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('리소스를 찾을 수 없음 | CloudDesk');
});

test('없는 리소스 주소는 안내와 목록 이동 링크를 보여준다', async ({ page }) => {
  await page.goto('/resources/i-does-not-exist');
  await expect(
    page.getByRole('heading', { level: 1, name: '리소스를 찾을 수 없습니다' }),
  ).toBeVisible();
  await expect(page.getByText('i-does-not-exist')).toBeVisible();
  await page.getByRole('link', { name: '리소스 목록으로' }).click();
  await expect(page).toHaveURL(/\/resources$/);
});

test('상세를 처음 열 때 콘솔 경고·오류가 없다', async ({ page }) => {
  const resource = await pickResource(page);
  const issues: string[] = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));
  await gotoDetail(page, resource);
  for (const name of ['모니터링', '네트워크', /이벤트 로그/]) await tab(page, name).click();
  await expect(page.getByRole('table', { name: '이벤트 로그' })).toBeVisible();
  expect(issues).toEqual([]);
});
