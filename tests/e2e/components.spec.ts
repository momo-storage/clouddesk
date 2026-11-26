import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * 공통 UI 컴포넌트(Phase 2-4) 동작 검증. UI 컴포넌트 가이드 화면의 예시를 대상으로 한다.
 * axe 통과는 자동 검사 가능한 항목에 한정되며, 접근성 준수 여부를 확정하지 않는다.
 */

/** 알림(Toast) 영역. 화면에는 표의 선택 개수 안내 등 다른 status 영역도 있다. */
const toastRegion = (page: Page) =>
  page.locator('[role="status"]').filter({ has: page.locator('ul') });

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

test.use({ viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/guide');
  await expect(page.getByRole('heading', { level: 1, name: 'UI 컴포넌트 가이드' })).toBeVisible();
});

test('가이드 화면에 axe 자동 검사 위반과 콘솔 오류가 없다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await expectNoAxeViolations(page);
  expect(errors).toEqual([]);
});

test('Input: 라벨·도움말·오류가 입력 요소에 연결된다', async ({ page }) => {
  const section = page.getByRole('region', { name: 'Input' });
  const name = section.getByLabel('리소스명');
  await expect(name).toHaveAccessibleDescription('영문 소문자, 숫자, 하이픈(-)만 사용합니다.');

  const ip = section.getByLabel('IP 주소');
  await expect(ip).toHaveAttribute('aria-invalid', 'true');
  await expect(ip).toHaveAccessibleDescription(/올바른 IPv4 주소 형식이 아닙니다/);

  const host = section.getByLabel('호스트 이름');
  await expect(host).toHaveAttribute('required', '');
  await host.fill('Web');
  await expect(host).toHaveAttribute('aria-invalid', 'true');
  await host.fill('web');
  await expect(host).not.toHaveAttribute('aria-invalid');
});

test('Checkbox: 전체 선택은 일부 선택 시 혼합 상태가 된다', async ({ page }) => {
  const all = page.getByRole('checkbox', { name: '전체 선택', exact: true });
  await expect(all).toHaveJSProperty('indeterminate', true);

  await all.check();
  await expect(page.getByRole('checkbox', { name: 'db-prod-01', exact: true })).toBeChecked();
  await expect(all).toHaveJSProperty('indeterminate', false);
});

test('Radio: 화살표 키로 선택이 이동한다', async ({ page }) => {
  const group = page.getByRole('group', { name: '클라우드 제공업체' });
  await group.getByRole('radio', { name: 'AWS' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Azure' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Azure' })).toBeFocused();
});

test('Switch: role=switch로 켜짐·꺼짐 상태를 전달한다', async ({ page }) => {
  const monitoring = page.getByRole('switch', { name: '모니터링 활성화' });
  await expect(monitoring).toBeChecked();
  await monitoring.focus();
  await page.keyboard.press('Space');
  await expect(monitoring).not.toBeChecked();
});

test('Button: 처리 중에는 aria-busy이고 초점을 유지한다', async ({ page }) => {
  const section = page.getByRole('region', { name: 'Button' });
  const save = section
    .getByRole('button', { name: '저장', exact: true })
    .and(section.locator(':enabled'));
  await save.focus();
  await page.keyboard.press('Enter');
  const busy = section.getByRole('button', { name: '저장 중' });
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  await expect(busy).toBeFocused();
});

const SYNC_TOOLTIP =
  '마지막 동기화: 5분 전. 클라우드 제공업체 API에서 리소스 상태와 사용률을 다시 가져옵니다.';

test('Tooltip: 초점에 나타나 설명으로 연결되고 ESC로 숨는다', async ({ page }) => {
  const sync = page.getByRole('button', { name: '동기화' });
  await sync.focus();
  const tooltip = page.getByRole('tooltip', { name: SYNC_TOOLTIP });
  await expect(tooltip).toBeVisible();
  await expect(sync).toHaveAccessibleDescription(SYNC_TOOLTIP);

  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(sync).toBeFocused();
});

test('Tooltip: 긴 문구는 최대 280px에서 줄바꿈되고 상자 밖으로 넘치지 않는다', async ({ page }) => {
  await page.getByRole('button', { name: '동기화' }).focus();
  const box = page.getByRole('tooltip').locator('span');
  const size = await box.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    overflow: element.scrollWidth - element.clientWidth,
  }));
  expect(size.width).toBeLessThanOrEqual(280);
  expect(size.overflow).toBe(0);
  // 한 줄(약 26px)보다 높으면 줄바꿈된 것이다.
  expect(size.height).toBeGreaterThan(30);
});

test('Tooltip: 320px 화면에서도 툴팁이 화면 밖으로 나가지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('button', { name: '동기화' }).focus();
  const rect = await page
    .getByRole('tooltip')
    .locator('span')
    .evaluate((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { left, right, viewport: document.documentElement.clientWidth };
    });
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.right).toBeLessThanOrEqual(rect.viewport);
  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(pageOverflow).toBe(0);
});

test('Button: aria-disabled 버튼은 초점을 받지만 클릭·키보드·폼 제출로 실행되지 않는다', async ({
  page,
}) => {
  const section = page.getByRole('region', { name: 'Button' });
  const save = section.getByRole('button', { name: '변경 사항 저장' });
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await expect(save).toHaveAccessibleDescription('변경한 내용이 없어 저장할 수 없습니다.');
  await expect(save).toHaveCSS('cursor', 'not-allowed');

  // Playwright는 aria-disabled 요소를 클릭 대기 대상에서 제외하므로, 실제 사용자 클릭처럼 강제로 누른다.
  await save.click({ force: true });
  await save.focus();
  await expect(save).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  // 입력 칸에서 Enter: 브라우저의 암시적 폼 제출도 막혀야 한다.
  await section.getByLabel('태그').focus();
  await page.keyboard.press('Enter');

  await expect(toastRegion(page)).not.toContainText('변경 사항 저장');
});

test('Modal: 첫 입력에 초점, ESC로 닫으면 실행 버튼으로 초점이 돌아온다', async ({ page }) => {
  const opener = page.getByRole('button', { name: '리소스 수정 열기' });
  await opener.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: '리소스 수정' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('리소스명')).toBeFocused();
  await expectNoAxeViolations(page);

  // 화면 가운데에 표시된다(전역 margin reset 회귀 방지).
  const box = await dialog.boundingBox();
  expect(box && Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(2);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('Modal: 배경 클릭 닫기는 기본으로 꺼져 있다(폼 보호)', async ({ page }) => {
  await page.getByRole('button', { name: '리소스 수정 열기' }).click();
  const dialog = page.getByRole('dialog', { name: '리소스 수정' });
  await page.mouse.click(5, 450);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '취소' }).click();
  await expect(dialog).toBeHidden();
});

test('Modal: 취소·ESC로 닫으면 onClose가 한 번만 실행된다', async ({ page }) => {
  const cancelToasts = toastRegion(page).getByText('리소스 수정을 취소했습니다.', {
    exact: false,
  });
  const opener = page.getByRole('button', { name: '리소스 수정 열기' });
  const dialog = page.getByRole('dialog', { name: '리소스 수정' });

  await opener.click();
  await dialog.getByRole('button', { name: '취소' }).click();
  await expect(dialog).toBeHidden();
  await expect(cancelToasts).toHaveCount(1);

  await opener.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(cancelToasts).toHaveCount(2);
});

test('Modal: 하단 저장 버튼이 form 속성으로 본문 폼을 제출한다', async ({ page }) => {
  await page.getByRole('button', { name: '리소스 수정 열기' }).click();
  const dialog = page.getByRole('dialog', { name: '리소스 수정' });
  await dialog.getByRole('button', { name: '저장' }).click();
  await expect(dialog).toBeHidden();
  await expect(toastRegion(page)).toContainText('리소스를 수정했습니다.');
  await expect(toastRegion(page)).not.toContainText('취소했습니다');
});

test('Modal: 긴 내용은 본문만 스크롤되고 dialog 자체는 스크롤되지 않는다', async ({ page }) => {
  await page.getByRole('button', { name: '리소스 수정 열기' }).click();
  const result = await page.getByRole('dialog', { name: '리소스 수정' }).evaluate((dialog) => {
    const form = dialog.querySelector('form');
    for (let index = 0; index < 40; index += 1) {
      const paragraph = document.createElement('p');
      paragraph.textContent = `긴 내용 ${index}`;
      form?.appendChild(paragraph);
    }
    const body = form?.parentElement;
    return {
      dialogScroll: dialog.scrollHeight - dialog.clientHeight,
      bodyScrolls: body ? body.scrollHeight > body.clientHeight : false,
      fitsViewport: dialog.getBoundingClientRect().bottom <= window.innerHeight,
    };
  });
  expect(result.dialogScroll).toBe(0);
  expect(result.bodyScrolls).toBe(true);
  expect(result.fitsViewport).toBe(true);
});

test('ConfirmModal: 배경 클릭 닫기를 명시적으로 허용한다', async ({ page }) => {
  const opener = page.getByRole('button', { name: '삭제 확인 열기' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '리소스 삭제' });
  await page.mouse.click(5, 450);
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('ConfirmModal: 초기 초점은 취소, 확인하면 닫히고 결과를 알린다', async ({ page }) => {
  const opener = page.getByRole('button', { name: '삭제 확인 열기' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '리소스 삭제' });
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();

  await dialog.getByRole('button', { name: '삭제', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    toastRegion(page).getByText('web-prod-01을 삭제했습니다.', { exact: false }),
  ).toBeVisible();
  await expect(opener).toBeFocused();
});

test('Dropdown: 항목을 고르면 닫히고 트리거로 초점이 돌아온다', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'web-prod-01 작업 더보기' });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('button', { name: '수정', exact: true }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('Tabs: 화살표·Home·End로 이동하고 선택 탭만 Tab 순서에 있다', async ({ page }) => {
  const tablist = page.getByRole('tablist', { name: '리소스 상세 정보' });
  const overview = tablist.getByRole('tab', { name: '개요' });
  await overview.focus();

  await page.keyboard.press('ArrowRight');
  const network = tablist.getByRole('tab', { name: '네트워크' });
  await expect(network).toBeFocused();
  await expect(network).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: '네트워크' })).toBeVisible();
  await expect(overview).toHaveAttribute('tabindex', '-1');

  await page.keyboard.press('End');
  await expect(tablist.getByRole('tab', { name: '이벤트 로그' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(overview).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tablist.getByRole('tab', { name: '이벤트 로그' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('Table: 정렬 상태를 aria-sort로 알리고 행 선택을 표시한다', async ({ page }) => {
  const table = page.getByRole('table', { name: '가상 서버 목록 (예시)' });
  const nameHeader = table.getByRole('columnheader', { name: /리소스명/ });
  await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

  await nameHeader.getByRole('button').click();
  await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  await expect(table.getByRole('row').nth(1)).toContainText('web-prod-01');

  const cpuHeader = table.getByRole('columnheader', { name: /CPU/ });
  await cpuHeader.getByRole('button').click();
  await expect(cpuHeader).toHaveAttribute('aria-sort', 'ascending');
  await expect(nameHeader).toHaveAttribute('aria-sort', 'none');

  await table.getByRole('checkbox', { name: 'db-prod-01 선택' }).check();
  await expect(page.getByText('1개 선택됨')).toBeVisible();

  // 가로 스크롤 영역은 이름이 있고 키보드로 초점을 받을 수 있다.
  const region = page.getByRole('region', { name: '가상 서버 목록 (예시)' });
  await expect(region).toHaveAttribute('tabindex', '0');
});

test('Pagination: 현재 페이지를 알리고, 마지막 페이지에 닿으면 현재 페이지로 초점이 이동한다', async ({
  page,
}) => {
  const nav = page.getByRole('navigation', { name: '페이지' });
  await expect(nav.getByRole('button', { name: '1 페이지', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(nav.getByRole('button', { name: '이전 페이지' })).toBeDisabled();

  await nav.getByRole('button', { name: '12 페이지', exact: true }).click();
  await nav.getByRole('button', { name: '11 페이지', exact: true }).click();
  const next = nav.getByRole('button', { name: '다음 페이지' });
  await next.focus();
  await page.keyboard.press('Enter');

  await expect(next).toBeDisabled();
  await expect(nav.getByRole('button', { name: '12 페이지', exact: true })).toBeFocused();
  await expect(nav.getByRole('button', { name: '12 페이지', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('Toast: 항상 있는 status 영역에 알림이 추가되고 닫기 버튼으로 닫힌다', async ({ page }) => {
  const status = page.locator('[role="status"]').filter({ has: page.locator('ul') });
  await expect(status).toHaveCount(1);

  await page.getByRole('button', { name: '오류 알림' }).click();
  await expect(status).toContainText('오류: 리소스를 삭제하지 못했습니다.');

  await status.getByRole('button', { name: '알림 닫기' }).click();
  await expect(status).not.toContainText('리소스를 삭제하지 못했습니다.');
});

test('Toast: 5초 뒤 자동으로 닫힌다', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: '안내 알림' }).click();
  const message = page.getByText('데모 데이터는 이 브라우저에만 저장됩니다.');
  await expect(message).toBeVisible();
  await page.clock.runFor(5100);
  await expect(message).toBeHidden();
});

test('Toast: 닫기 버튼으로 닫으면 남은 알림 → 알림 영역 진입 전 요소 순으로 초점이 이동한다', async ({
  page,
}) => {
  await page.getByRole('button', { name: '오류 알림' }).click();
  const infoButton = page.getByRole('button', { name: '안내 알림' });
  await infoButton.click();

  const closeButtons = toastRegion(page).getByRole('button', { name: '알림 닫기' });
  await expect(closeButtons).toHaveCount(2);

  await closeButtons.first().focus();
  await page.keyboard.press('Enter');
  await expect(closeButtons).toHaveCount(1);
  await expect(closeButtons.first()).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(closeButtons).toHaveCount(0);
  await expect(infoButton).toBeFocused();
});

test('Toast: 자동으로 닫힐 때는 사용자의 초점을 옮기지 않는다', async ({ page }) => {
  await page.clock.install();
  const trigger = page.getByRole('button', { name: '성공 알림' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(toastRegion(page)).toContainText('리소스를 등록했습니다.');
  await page.clock.runFor(5100);
  await expect(toastRegion(page)).not.toContainText('리소스를 등록했습니다.');
  await expect(trigger).toBeFocused();
});
