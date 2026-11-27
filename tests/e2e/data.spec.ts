import { expect, test, type Page } from '@playwright/test';

import { expectNoAxeViolations } from './support/axe';

/**
 * Mock 데이터 유지·초기화와 헤더 알림 연결(Phase 2-5).
 * 데이터 규칙 자체(수량, 관계, 결정성, 서비스 등록·수정·삭제)는 npm run check:data에서 검사한다.
 */

const STORAGE_KEY = 'clouddesk:data';

interface StoredData {
  version: number;
  resources: { id: string; name: string }[];
  events: { id: string; message: string; read: boolean }[];
  users: { id: string }[];
}

async function readStored(page: Page): Promise<StoredData | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredData) : null;
  }, STORAGE_KEY);
}

/** 데이터 불러오기(300~600ms 지연)가 끝나 알림 개수가 표시될 때까지 기다린다. */
async function gotoAndWaitForData(page: Page, unread = 5) {
  await page.goto('/dashboard');
  await expect(
    page.getByRole('button', { name: `알림, 읽지 않은 알림 ${String(unread)}건` }),
  ).toBeVisible();
}

test.use({ viewport: { width: 1440, height: 900 } });

test('첫 방문에 시드 데이터를 저장하고, 새로고침해도 같은 데이터를 쓴다', async ({ page }) => {
  await gotoAndWaitForData(page);
  const first = await readStored(page);
  expect(first?.version).toBe(1);
  expect(first?.resources).toHaveLength(80);
  expect(first?.users).toHaveLength(24);

  // 저장 데이터를 지우고 다시 열어도 시드는 같은 값이다(새로고침마다 바뀌지 않음).
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, STORAGE_KEY);
  await gotoAndWaitForData(page);
  expect(await readStored(page)).toEqual(first);
});

test('손상된 저장 데이터는 버리고 시드 데이터로 시작한다', async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, '{"version":1,"resources":"broken"');
  }, STORAGE_KEY);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await gotoAndWaitForData(page);
  expect((await readStored(page))?.resources).toHaveLength(80);
  expect(errors).toEqual([]);
});

test('헤더 알림: 최근 이벤트 5건을 보여주고, 모두 읽음은 저장되어 새로고침 후에도 유지된다', async ({
  page,
}) => {
  await gotoAndWaitForData(page);
  const stored = await readStored(page);

  const bell = page.getByRole('button', { name: '알림, 읽지 않은 알림 5건' });
  await bell.click();
  const panel = page.locator(`#${(await bell.getAttribute('aria-controls')) ?? ''}`);
  const items = panel.getByRole('listitem');
  await expect(items).toHaveCount(5);
  await expect(items.first()).toContainText(stored?.events[0]?.message ?? '');
  await expect(items.first()).toContainText('읽지 않음');
  await expect(panel).toContainText(`전체 ${String(stored?.events.length)}건 중 최근 5건`);
  await expectNoAxeViolations(page);

  const markAll = panel.getByRole('button', { name: '모두 읽음' });
  await markAll.click();
  await expect(page.getByRole('button', { name: '알림', exact: true })).toBeVisible();
  // 누른 버튼은 사라지지 않고 비활성 상태로 남아 초점을 유지한다.
  await expect(markAll).toHaveAttribute('aria-disabled', 'true');
  await expect(markAll).toBeFocused();

  await page.reload();
  await expect(page.getByRole('button', { name: '알림', exact: true })).toBeVisible();
  expect((await readStored(page))?.events.every((event) => event.read)).toBe(true);
});

test('데모 데이터 초기화: 확인 후 시드 상태로 돌아가고 사용자 메뉴로 초점이 돌아온다', async ({
  page,
}) => {
  await gotoAndWaitForData(page);
  const seed = await readStored(page);

  // 변경 내용을 만든다(알림 모두 읽음).
  await page.getByRole('button', { name: '알림, 읽지 않은 알림 5건' }).click();
  await page.getByRole('button', { name: '모두 읽음' }).click();
  await expect(page.getByRole('button', { name: '알림', exact: true })).toBeVisible();

  const userMenu = page.getByRole('button', { name: '김데모 계정 메뉴' });
  await userMenu.click();
  await page.getByRole('button', { name: '데모 데이터 초기화' }).click();

  const dialog = page.getByRole('dialog', { name: '데모 데이터 초기화' });
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();
  await dialog.getByRole('button', { name: '초기화', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status').filter({ has: page.locator('ul') })).toContainText(
    '데모 데이터를 처음 상태로 초기화했습니다.',
  );
  await expect(page.getByRole('button', { name: '알림, 읽지 않은 알림 5건' })).toBeVisible();
  await expect(userMenu).toBeFocused();
  expect(await readStored(page)).toEqual(seed);
});

test('초기화는 사이드바 접기 설정을 지우지 않는다', async ({ page }) => {
  await gotoAndWaitForData(page);
  await page.getByRole('button', { name: '사이드바 접기' }).click();

  await page.getByRole('button', { name: '김데모 계정 메뉴' }).click();
  await page.getByRole('button', { name: '데모 데이터 초기화' }).click();
  await page
    .getByRole('dialog', { name: '데모 데이터 초기화' })
    .getByRole('button', { name: '초기화', exact: true })
    .click();
  await expect(page.getByRole('dialog', { name: '데모 데이터 초기화' })).toBeHidden();

  await page.reload();
  await expect(page.getByRole('button', { name: '사이드바 펼치기' })).toBeVisible();
});

test('375px: 알림 패널이 화면 밖으로 나가지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoAndWaitForData(page);
  const bell = page.getByRole('button', { name: '알림, 읽지 않은 알림 5건' });
  await bell.click();
  const panel = page.locator(`#${(await bell.getAttribute('aria-controls')) ?? ''}`);
  const box = await panel.evaluate((element) => {
    const { left, right } = element.getBoundingClientRect();
    return { left, right, viewport: document.documentElement.clientWidth };
  });
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(box.viewport);
});
