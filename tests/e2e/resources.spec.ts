import { expect, test, type Page } from '@playwright/test';

import { expectNoAxeViolations } from './support/axe';

/**
 * 리소스 관리 목록·CRUD(Phase 3-2).
 * 검색·필터·정렬·페이지의 URL 동기화, 등록·수정·삭제와 그 뒤의 초점 이동, 빈 상태, 반응형을 확인한다.
 * axe 검사는 선택 실행이다(support/axe.ts).
 */

const STORAGE_KEY = 'clouddesk:data';

interface StoredResource {
  id: string;
  name: string;
  provider: string;
  status: string;
  cpuUsage: number;
  createdAt: string;
}

async function storedResources(page: Page): Promise<StoredResource[]> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { resources: StoredResource[] }).resources : [];
  }, STORAGE_KEY);
}

const resultStatus = (page: Page) => page.getByRole('status').filter({ hasText: /전체 \d+개/ });

/** 목록을 열고 데이터 불러오기(300~600ms)가 끝날 때까지 기다린다. */
async function gotoList(page: Page, search = '') {
  await page.goto(`/resources${search}`);
  await expect(resultStatus(page)).toBeVisible();
}

const table = (page: Page) => page.getByRole('table', { name: '가상 서버 리소스' });
/** 데이터 행(머리글 행 제외) */
const dataRows = (page: Page) => table(page).locator('tbody tr');
const nameLinks = (page: Page) => table(page).locator('tbody a');

test.use({ viewport: { width: 1440, height: 900 } });

test('불러오는 동안 Skeleton 행과 로딩 문구를 보여준다', async ({ page }) => {
  await page.goto('/resources');
  await expect(page.getByRole('status').filter({ hasText: '불러오는 중' })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(1);
  await expect(resultStatus(page)).toHaveText('전체 80개');
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(dataRows(page)).toHaveCount(20);
});

test('대시보드 지표 링크의 상태 조건이 목록 필터로 적용된다', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: '실행 중 리소스 보기' }).click();
  await expect(page).toHaveURL(/\/resources\?status=running$/);
  await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();

  const running = (await storedResources(page)).filter((r) => r.status === 'running').length;
  await expect(resultStatus(page)).toHaveText(`검색 결과 ${String(running)}개 · 전체 80개`);
  await expect(page.getByRole('combobox', { name: '상태' })).toHaveValue('running');
  // 현재 페이지의 모든 행이 실행 중이다.
  const statuses = await dataRows(page).locator('td:nth-child(8)').allInnerTexts();
  expect(statuses.every((text) => text.includes('실행 중'))).toBe(true);
});

test('검색어는 Enter로만 적용되고, 조건 초기화는 입력란과 주소를 함께 비운다', async ({ page }) => {
  await gotoList(page);
  const input = page.getByRole('searchbox', { name: '검색어' });
  await input.fill('erp');
  // 입력만으로는 결과가 바뀌지 않는다.
  await expect(resultStatus(page)).toHaveText('전체 80개');

  await input.press('Enter');
  await expect(page).toHaveURL(/\?q=erp$/);
  const expected = (await storedResources(page)).filter((r) => r.name.includes('erp')).length;
  await expect(resultStatus(page)).toHaveText(`검색 결과 ${String(expected)}개 · 전체 80개`);
  // 같은 경로의 쿼리 변경이므로 초점은 입력란에 그대로 있다(설계서 8-1).
  await expect(input).toBeFocused();

  // IP로도 찾는다.
  await input.fill('10.30.');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  const gcp = (await storedResources(page)).filter((r) => r.provider === 'gcp').length;
  await expect(resultStatus(page)).toHaveText(`검색 결과 ${String(gcp)}개 · 전체 80개`);

  const reset = page.getByRole('button', { name: '조건 초기화' });
  await reset.click();
  await expect(page).toHaveURL(/\/resources$/);
  await expect(input).toHaveValue('');
  await expect(resultStatus(page)).toHaveText('전체 80개');
  // 초기화 뒤에는 비활성(aria-disabled)이지만 초점은 유지된다.
  await expect(reset).toBeFocused();
  await expect(reset).toHaveAttribute('aria-disabled', 'true');
});

test('필터·정렬·페이지·페이지 크기가 주소에 남아 새로고침해도 유지된다', async ({ page }) => {
  await gotoList(page);
  await page.getByRole('combobox', { name: '제공업체' }).selectOption('aws');
  await expect(page).toHaveURL(/\?provider=aws$/);

  // CPU 열 정렬: 처음 누르면 내림차순(숫자 열), 다시 누르면 오름차순
  const cpuHeader = table(page).getByRole('columnheader', { name: 'CPU (%)' });
  await cpuHeader.getByRole('button').click();
  await expect(cpuHeader).toHaveAttribute('aria-sort', 'descending');
  await expect(page).toHaveURL(/provider=aws&sort=cpuUsage&order=desc$/);
  const aws = (await storedResources(page)).filter((r) => r.provider === 'aws');
  const topCpu = [...aws].sort((a, b) => b.cpuUsage - a.cpuUsage)[0];
  await expect(nameLinks(page).first()).toHaveText(topCpu?.name ?? '');
  await expect(table(page).getByRole('columnheader', { name: '생성일' })).toHaveAttribute(
    'aria-sort',
    'none',
  );

  await page.getByRole('button', { name: '2 페이지' }).click();
  await expect(page).toHaveURL(/page=2$/);
  await page.reload();
  await expect(resultStatus(page)).toBeVisible();
  await expect(page.getByRole('combobox', { name: '제공업체' })).toHaveValue('aws');
  await expect(cpuHeader).toHaveAttribute('aria-sort', 'descending');
  await expect(page.getByRole('button', { name: '2 페이지' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // 페이지 크기를 바꾸면 1페이지로 돌아간다.
  await page.getByRole('combobox', { name: '페이지당 행 수' }).selectOption('50');
  await expect(page).toHaveURL(/provider=aws&sort=cpuUsage&order=desc&size=50$/);
  await expect(dataRows(page)).toHaveCount(aws.length);
  await expect(page.getByRole('navigation', { name: '리소스 목록 페이지' })).toHaveCount(0);
});

test('주소의 잘못된 값은 무시하고, 범위를 넘는 페이지는 마지막 페이지를 보여준다', async ({
  page,
}) => {
  await gotoList(page, '?status=unknown&sort=hack&size=7&page=999');
  await expect(resultStatus(page)).toHaveText('전체 80개');
  await expect(page.getByRole('button', { name: '4 페이지' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(dataRows(page)).toHaveCount(20);
});

test('검색 결과가 없으면 빈 상태를 보여주고, 조건 초기화 후 목록 제목으로 초점을 옮긴다', async ({
  page,
}) => {
  await gotoList(page, '?q=no-such-resource');
  const empty = page.getByRole('heading', { level: 3, name: '조건에 맞는 리소스가 없습니다' });
  await expect(empty).toBeVisible();
  await expect(table(page)).toHaveCount(0);

  await page.getByRole('main').getByRole('button', { name: '조건 초기화' }).last().click();
  await expect(resultStatus(page)).toHaveText('전체 80개');
  await expect(page.getByRole('heading', { level: 2, name: '리소스 목록' })).toBeFocused();
});

test('리소스가 하나도 없으면 등록을 안내한다', async ({ page }) => {
  await gotoList(page);
  await page.evaluate((key) => {
    const data = JSON.parse(window.localStorage.getItem(key) ?? '{}') as { resources: unknown[] };
    data.resources = [];
    window.localStorage.setItem(key, JSON.stringify(data));
  }, STORAGE_KEY);
  await page.reload();
  await expect(
    page.getByRole('heading', { level: 3, name: '등록된 리소스가 없습니다' }),
  ).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: '리소스 등록' })).toHaveCount(2);
});

test('등록: 필수·형식 오류는 입력란에 연결되고 첫 오류 칸으로 초점이 간다', async ({ page }) => {
  await gotoList(page);
  const openButton = page.getByRole('button', { name: '리소스 등록' });
  await openButton.click();
  const dialog = page.getByRole('dialog', { name: '리소스 등록' });
  const name = dialog.getByRole('textbox', { name: '리소스명' });
  await expect(name).toBeFocused();

  await dialog.getByRole('button', { name: '등록' }).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription(/리소스명을 입력하세요/);
  await expect(dialog.getByRole('combobox', { name: '리전' })).toHaveAccessibleDescription(
    '리전을 선택하세요.',
  );

  // 형식 오류와 같은 이름 검사
  const existing = (await storedResources(page))[0]?.name ?? '';
  await name.fill('Web_01');
  await expect(name).toHaveAccessibleDescription(/소문자로 시작하고/);
  await name.fill(existing);
  await expect(name).toHaveAccessibleDescription(/같은 이름의 리소스가 이미 있습니다/);

  // 제공업체를 바꾸면 리전 선택지가 그 제공업체 것으로 바뀐다.
  await dialog.getByRole('combobox', { name: '클라우드 제공업체' }).selectOption('gcp');
  await expect(
    dialog.getByRole('combobox', { name: '리전' }).getByRole('option', { name: /asia-northeast3/ }),
  ).toHaveCount(1);

  const privateIp = dialog.getByRole('textbox', { name: '사설 IP 주소' });
  await privateIp.fill('8.8.8.8');
  await expect(privateIp).toHaveAccessibleDescription(/사설 대역/);

  await expectNoAxeViolations(page, { include: 'dialog' });

  // ESC로 닫으면 실행 버튼으로 초점이 돌아온다.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});

test('등록: 저장하면 목록 맨 위에 나타나고 알림과 함께 실행 버튼으로 초점이 돌아온다', async ({
  page,
}) => {
  await gotoList(page);
  const openButton = page.getByRole('button', { name: '리소스 등록' });
  await openButton.click();
  const dialog = page.getByRole('dialog', { name: '리소스 등록' });

  await dialog.getByRole('textbox', { name: '리소스명' }).fill('prod-search-01');
  await dialog.getByRole('combobox', { name: '클라우드 제공업체' }).selectOption('azure');
  await dialog.getByRole('combobox', { name: '리전' }).selectOption('koreacentral');
  await dialog.getByRole('combobox', { name: '인스턴스 유형' }).selectOption('Standard_D4s_v5');
  await dialog.getByRole('combobox', { name: '운영체제' }).selectOption('Rocky Linux 9');
  await dialog.getByRole('textbox', { name: '사설 IP 주소' }).fill('10.20.5.10');
  await dialog.getByRole('textbox', { name: '공인 IP 주소(선택)' }).fill('203.0.113.50');
  // Enter로도 제출된다(모달 하단 버튼은 form 속성으로 연결).
  await dialog.getByRole('textbox', { name: '공인 IP 주소(선택)' }).press('Enter');

  await expect(dialog).toBeHidden();
  await expect(page.getByText("'prod-search-01' 리소스를 등록했습니다.")).toBeVisible();
  await expect(openButton).toBeFocused();
  await expect(resultStatus(page)).toHaveText('전체 81개');
  // 기본 정렬(생성일 내림차순)이라 새 리소스가 첫 행이다.
  await expect(nameLinks(page).first()).toHaveText('prod-search-01');
  await expect(dataRows(page).first()).toContainText('203.0.113.50');

  const stored = (await storedResources(page)).find((r) => r.name === 'prod-search-01');
  expect(stored?.provider).toBe('azure');
});

test('수정: 기존 값을 채워 열고, 저장하면 행이 바뀌며 그 행의 수정 버튼으로 초점이 돌아온다', async ({
  page,
}) => {
  await gotoList(page);
  const firstName = (await nameLinks(page).first().textContent()) ?? '';
  const editButton = page.getByRole('button', { name: `${firstName} 수정` });
  await editButton.click();

  const dialog = page.getByRole('dialog', { name: '리소스 수정' });
  const name = dialog.getByRole('textbox', { name: '리소스명' });
  await expect(name).toHaveValue(firstName);
  await expect(dialog.getByRole('combobox', { name: '클라우드 제공업체' })).toBeDisabled();

  await name.fill(`${firstName}-renamed`);
  await dialog.getByRole('button', { name: '저장' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`'${firstName}-renamed' 리소스 정보를 수정했습니다.`)).toBeVisible();
  await expect(nameLinks(page).first()).toHaveText(`${firstName}-renamed`);
  await expect(page.getByRole('button', { name: `${firstName}-renamed 수정` })).toBeFocused();
});

test('단건 삭제: 확인 모달은 취소에 초점을 두고, 삭제 후 다음 행의 리소스명으로 초점을 옮긴다', async ({
  page,
}) => {
  await gotoList(page);
  const names = await nameLinks(page).allInnerTexts();
  const target = names[1] ?? '';
  const deleteButton = page.getByRole('button', { name: `${target} 삭제` });

  await deleteButton.click();
  const dialog = page.getByRole('dialog', { name: '리소스 삭제' });
  await expect(dialog).toContainText(target);
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();
  await expectNoAxeViolations(page, { include: 'dialog' });

  // 취소하면 실행 요소로 돌아온다.
  await page.keyboard.press('Escape');
  await expect(deleteButton).toBeFocused();

  await deleteButton.click();
  await dialog.getByRole('button', { name: '삭제' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`'${target}' 리소스를 삭제했습니다.`)).toBeVisible();
  await expect(resultStatus(page)).toHaveText('전체 79개');
  await expect(page.getByRole('link', { name: names[2] ?? '' })).toBeFocused();
  expect((await storedResources(page)).some((r) => r.name === target)).toBe(false);
});

test('마지막 결과를 삭제하면 빈 상태 제목으로 초점을 옮긴다', async ({ page }) => {
  await gotoList(page);
  const target = (await nameLinks(page).first().textContent()) ?? '';
  await gotoList(page, `?q=${target}`);
  await expect(dataRows(page)).toHaveCount(1);

  await page.getByRole('button', { name: `${target} 삭제` }).click();
  await page
    .getByRole('dialog', { name: '리소스 삭제' })
    .getByRole('button', { name: '삭제' })
    .click();
  await expect(
    page.getByRole('heading', { level: 3, name: '조건에 맞는 리소스가 없습니다' }),
  ).toBeFocused();
});

test('다중 선택: 현재 페이지 전체 선택과 선택 삭제, 삭제 후 목록 제목으로 초점 이동', async ({
  page,
}) => {
  await gotoList(page);
  const names = await nameLinks(page).allInnerTexts();
  await page.getByRole('checkbox', { name: `${names[0] ?? ''} 선택` }).check();
  await page.getByRole('checkbox', { name: `${names[3] ?? ''} 선택` }).check();
  const selectAll = page.getByRole('checkbox', { name: '현재 페이지 전체 선택' });
  // 일부만 선택하면 전체 선택 체크박스는 "혼합" 상태다.
  expect(await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
  await expect(page.getByText('2개 선택됨')).toBeVisible();
  // 선택한 행은 배경과 체크 상태로 함께 표시된다.
  await expect(dataRows(page).first()).toHaveClass(/selected/);

  await selectAll.check();
  await expect(page.getByText('20개 선택됨')).toBeVisible();

  // 페이지를 넘겨도 선택은 유지된다.
  await page.getByRole('button', { name: '2 페이지' }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(nameLinks(page).first()).not.toHaveText(names[0] ?? '');
  await expect(page.getByText('20개 선택됨')).toBeVisible();
  await page.getByRole('checkbox', { name: '현재 페이지 전체 선택' }).check();
  await expect(page.getByText('40개 선택됨')).toBeVisible();

  const bulkDelete = page.getByRole('button', { name: '선택 삭제' });
  await bulkDelete.click();
  const dialog = page.getByRole('dialog', { name: '선택한 리소스 삭제' });
  await expect(dialog).toContainText('선택한 리소스 40개를 삭제하시겠습니까?');
  await expect(dialog).toContainText('외 35개');
  await dialog.getByRole('button', { name: '삭제' }).click();

  await expect(page.getByText('리소스 40개를 삭제했습니다.')).toBeVisible();
  await expect(resultStatus(page)).toHaveText('전체 40개');
  await expect(page.getByRole('heading', { level: 2, name: '리소스 목록' })).toBeFocused();
  await expect(bulkDelete).toHaveCount(0);
});

test('검색·필터를 바꾸면 선택을 비운다(보이지 않는 리소스가 함께 삭제되지 않게)', async ({
  page,
}) => {
  await gotoList(page);
  await page.getByRole('checkbox', { name: '현재 페이지 전체 선택' }).check();
  await expect(page.getByText('20개 선택됨')).toBeVisible();
  await page.getByRole('combobox', { name: '상태' }).selectOption('stopped');
  await expect(page.getByText(/개 선택됨/)).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: '현재 페이지 전체 선택' })).not.toBeChecked();
});

test('정렬·페이지 크기를 바꿔도 선택은 유지된다', async ({ page }) => {
  await gotoList(page);
  const names = await nameLinks(page).allInnerTexts();
  const picked = [names[0] ?? '', names[5] ?? ''];
  for (const name of picked) await page.getByRole('checkbox', { name: `${name} 선택` }).check();
  await expect(page.getByText('2개 선택됨')).toBeVisible();

  await table(page).getByRole('columnheader', { name: 'CPU (%)' }).getByRole('button').click();
  await expect(page).toHaveURL(/sort=cpuUsage/);
  await expect(page.getByText('2개 선택됨')).toBeVisible();

  await page.getByRole('combobox', { name: '페이지당 행 수' }).selectOption('50');
  await expect(dataRows(page)).toHaveCount(50);
  await expect(page.getByText('2개 선택됨')).toBeVisible();
  // 현재 페이지에 보이는 선택 행은 체크 상태로 표시된다.
  const checkedOnPage = await table(page)
    .locator('tbody input[type=checkbox]:checked')
    .evaluateAll((inputs) => inputs.length);
  const pickedOnPage = await Promise.all(
    picked.map((name) => page.getByRole('checkbox', { name: `${name} 선택` }).count()),
  );
  expect(checkedOnPage).toBe(pickedOnPage.reduce((sum, count) => sum + count, 0));
});

test('선택 삭제 확인 모달의 개수·이름과 실제 삭제 대상이 같다', async ({ page }) => {
  await gotoList(page);
  const firstPage = await nameLinks(page).allInnerTexts();
  await page.getByRole('checkbox', { name: `${firstPage[2] ?? ''} 선택` }).check();
  await page.getByRole('button', { name: '2 페이지' }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(nameLinks(page).first()).not.toHaveText(firstPage[0] ?? '');
  const secondPage = await nameLinks(page).allInnerTexts();
  await page.getByRole('checkbox', { name: `${secondPage[0] ?? ''} 선택` }).check();
  await page.getByRole('checkbox', { name: `${secondPage[7] ?? ''} 선택` }).check();
  const picked = [firstPage[2], secondPage[0], secondPage[7]].map((name) => name ?? '');

  await page.getByRole('button', { name: '선택 삭제' }).click();
  const dialog = page.getByRole('dialog', { name: '선택한 리소스 삭제' });
  await expect(dialog).toContainText('선택한 리소스 3개를 삭제하시겠습니까?');
  for (const name of picked) await expect(dialog.getByText(name, { exact: true })).toHaveCount(1);
  await dialog.getByRole('button', { name: '삭제' }).click();

  await expect(page.getByText('리소스 3개를 삭제했습니다.')).toBeVisible();
  const remaining = (await storedResources(page)).map((r) => r.name);
  expect(remaining).toHaveLength(77);
  expect(picked.filter((name) => remaining.includes(name))).toEqual([]);
});

test('PC(1280px 이상)에서만 리소스명·관리 열을 가로 스크롤에 고정한다', async ({ page }) => {
  const position = (cell: 'first' | 'last') =>
    table(page)
      .locator(`tbody tr:first-child td:nth-child(${cell === 'first' ? '2' : 'n+11'})`)
      .evaluate((el) => getComputedStyle(el).position);

  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoList(page);
  expect(await position('first')).toBe('sticky');
  expect(await position('last')).toBe('sticky');

  // 가로로 끝까지 스크롤해도 리소스명 링크가 화면 안에 남아 있다.
  const region = page.getByRole('region', { name: '가상 서버 리소스' });
  await region.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  await expect(nameLinks(page).first()).toBeInViewport();

  await page.setViewportSize({ width: 1024, height: 900 });
  expect(await position('first')).toBe('static');
  expect(await position('last')).toBe('static');
});

test('목록 행은 한 줄(40~44px)로 표시한다', async ({ page }) => {
  await gotoList(page);
  const heights = await dataRows(page).evaluateAll((rows) =>
    rows.map((row) => Math.round(row.getBoundingClientRect().height)),
  );
  expect(Math.max(...heights)).toBeLessThanOrEqual(44);
  expect(Math.min(...heights)).toBeGreaterThanOrEqual(40);
});

test('선택 해제 버튼은 선택을 비우고 목록 제목으로 초점을 옮긴다', async ({ page }) => {
  await gotoList(page);
  await page.getByRole('checkbox', { name: '현재 페이지 전체 선택' }).check();
  await page.getByRole('button', { name: '선택 해제' }).click();
  await expect(page.getByText(/개 선택됨/)).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: '리소스 목록' })).toBeFocused();
});

test('키보드만으로 정렬·행 작업을 할 수 있고, 표는 머리글 구조와 접근 가능한 이름을 가진다', async ({
  page,
}) => {
  await gotoList(page);
  const nameHeader = table(page).getByRole('columnheader', { name: '리소스명' });
  await nameHeader.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  await page.keyboard.press('Space');
  await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  // 정렬 후에도 초점은 정렬 버튼에 남는다.
  await expect(nameHeader.getByRole('button')).toBeFocused();

  await expect(table(page).getByRole('columnheader')).toHaveCount(11);
  await expectNoAxeViolations(page);
});

test('목록을 처음 열 때 콘솔 경고·오류가 없다', async ({ page }) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));
  await gotoList(page);
  expect(issues).toEqual([]);
});

for (const width of [1920, 1440, 1280, 1024, 768, 375, 320]) {
  test(`${String(width)}px: 페이지 전체 가로 스크롤이 없고 표 영역만 스크롤한다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoList(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    if (width < 1920) {
      await expect(
        page.getByRole('region', { name: '가상 서버 리소스' }),
      ).toHaveAccessibleDescription('표를 좌우로 스크롤하면 모든 열을 볼 수 있습니다.');
    }
  });
}
