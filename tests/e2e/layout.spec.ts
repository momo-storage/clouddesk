import { expect, test, type Page } from '@playwright/test';

import { expectNoAxeViolations } from './support/axe';

/**
 * 공통 레이아웃(Phase 2-3) 검증.
 * 키보드 동작은 Tab을 여러 번 누르는 대신 대상 요소에 초점을 둔 뒤 키를 누르는 방식으로 확인한다.
 * 메뉴 구성이 바뀌어도 테스트가 Tab 순서에 묶여 깨지지 않게 하기 위해서다.
 */

async function gotoAndWait(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** 저장된 데모 데이터의 첫 리소스(상세 화면 경로용). 데이터가 저장될 때까지 기다린다. */
async function firstResource(page: Page): Promise<{ id: string; name: string }> {
  await page.goto('/resources');
  await expect(page.getByRole('status').filter({ hasText: /전체 \d+개/ })).toBeVisible();
  return page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('clouddesk:data') ?? '{}') as {
      resources: { id: string; name: string }[];
    };
    const [first] = data.resources;
    if (!first) throw new Error('리소스가 없습니다.');
    return first;
  });
}

const mainNav = (page: Page) => page.getByRole('navigation', { name: '주 메뉴' });

test.describe('라우팅과 초점 관리', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('최초 로드에서는 초점을 옮기지 않는다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });

  test('본문 바로가기는 첫 Tab에 나타나고 본문 제목으로 초점을 옮긴다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: '본문 바로가기' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeFocused();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('메뉴로 이동하면 제목·현재 메뉴가 바뀌고 h1로 초점이 이동한다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');

    const link = mainNav(page).getByRole('link', { name: '리소스 관리' });
    await link.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/resources$/);
    await expect(page).toHaveTitle('리소스 관리 | CloudDesk');
    await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(mainNav(page).getByRole('link', { name: '대시보드' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  test('브라우저 뒤로 가기에도 h1로 초점이 이동한다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await mainNav(page).getByRole('link', { name: 'UI 컴포넌트 가이드' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'UI 컴포넌트 가이드' })).toBeFocused();

    await page.goBack();
    await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeFocused();
    await expect(page).toHaveTitle('대시보드 | CloudDesk');
  });

  test('상세 페이지는 Breadcrumb을 표시하고 상위 메뉴를 현재 섹션으로 표시한다', async ({
    page,
  }) => {
    const resource = await firstResource(page);
    await gotoAndWait(page, `/resources/${resource.id}`);

    const breadcrumb = page.getByRole('navigation', { name: '경로' });
    await expect(breadcrumb.getByRole('link', { name: '리소스 관리' })).toHaveAttribute(
      'href',
      '/resources',
    );
    await expect(breadcrumb.getByText(resource.name)).toHaveAttribute('aria-current', 'page');
    await expect(mainNav(page).getByRole('link', { name: '리소스 관리' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(page).toHaveTitle(`${resource.name} | CloudDesk`);
    await expectNoAxeViolations(page);
  });

  test('1단계 페이지에는 Breadcrumb이 없다', async ({ page }) => {
    await gotoAndWait(page, '/resources');
    await expect(page.getByRole('navigation', { name: '경로' })).toHaveCount(0);
  });

  test('없는 주소와 2차 개발 화면 주소는 404 화면을 보여준다', async ({ page }) => {
    for (const path of ['/no-such-page', '/costs']) {
      await gotoAndWait(page, path);
      await expect(
        page.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
      ).toBeVisible();
      await expect(page).toHaveTitle('페이지를 찾을 수 없습니다 | CloudDesk');
    }
    await expectNoAxeViolations(page);

    await page.getByRole('link', { name: '대시보드로 이동' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeFocused();
  });
});

test.describe('데스크톱 사이드바', () => {
  test('1440px: 기본 펼침, 접기 상태를 aria-expanded로 알리고 새로고침 후에도 유지한다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndWait(page, '/dashboard');

    const toggle = page.getByRole('button', { name: '사이드바 접기' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const navWidth = () =>
      mainNav(page).evaluate((element) => element.getBoundingClientRect().width);
    expect(await navWidth()).toBeGreaterThan(200);

    await toggle.focus();
    await page.keyboard.press('Enter');
    const expandButton = page.getByRole('button', { name: '사이드바 펼치기' });
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    await expect(expandButton).toBeFocused();
    await expect.poll(navWidth).toBeLessThan(60);

    // 접힌 상태에서도 메뉴 이름은 링크의 접근 가능한 이름으로 유지된다.
    await expect(mainNav(page).getByRole('link', { name: '대시보드' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: '사이드바 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('1024px: 기본 접힘, 아이콘 툴팁은 초점에 나타나고 ESC로 숨긴다', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoAndWait(page, '/dashboard');
    await expect(page.getByRole('button', { name: '사이드바 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    const link = mainNav(page).getByRole('link', { name: '리소스 관리' });
    const tooltip = link.locator('xpath=following-sibling::span[@aria-hidden="true"]');
    await link.focus();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('리소스 관리');

    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
    await expect(link).toBeFocused();

    await expectNoAxeViolations(page);
  });
});

test.describe('모바일 메뉴 서랍', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('메뉴 버튼으로 서랍을 열고 ESC로 닫으면 메뉴 버튼으로 초점이 돌아온다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await expect(page.getByRole('button', { name: /사이드바/ })).toHaveCount(0);

    const menuButton = page.getByRole('button', { name: '주 메뉴' });
    await menuButton.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: '메뉴' });
    await expect(dialog).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expectNoAxeViolations(page);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('서랍에서 메뉴를 고르면 서랍이 닫히고 새 페이지의 h1로 초점이 이동한다', async ({
    page,
  }) => {
    await gotoAndWait(page, '/dashboard');
    await page.getByRole('button', { name: '주 메뉴' }).click();

    const dialog = page.getByRole('dialog', { name: '메뉴' });
    const link = dialog.getByRole('link', { name: '리소스 관리' });
    await link.focus();
    await page.keyboard.press('Enter');

    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: '리소스 관리' })).toBeFocused();
  });

  test('닫기 버튼으로 닫아도 메뉴 버튼으로 초점이 돌아온다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    const menuButton = page.getByRole('button', { name: '주 메뉴' });
    await menuButton.click();
    await page.getByRole('button', { name: '메뉴 닫기' }).click();

    await expect(page.getByRole('dialog', { name: '메뉴' })).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  // 모달 공통 훅의 배경 클릭 기본값이 false로 바뀐 뒤에도 서랍은 명시적으로 허용한다.
  test('배경을 누르면 서랍이 닫히고 메뉴 버튼으로 초점이 돌아온다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    const menuButton = page.getByRole('button', { name: '주 메뉴' });
    await menuButton.click();
    await page.mouse.click(360, 400);

    await expect(page.getByRole('dialog', { name: '메뉴' })).toBeHidden();
    await expect(menuButton).toBeFocused();
  });
});

test.describe('헤더 드롭다운', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('사용자 메뉴는 Enter로 열고 ESC로 닫으며 트리거로 초점이 돌아온다', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');

    const trigger = page.getByRole('button', { name: '김데모 계정 메뉴' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const guideLink = page.getByRole('banner').getByRole('link', { name: 'UI 컴포넌트 가이드' });
    await expect(guideLink).toBeVisible();
    await expectNoAxeViolations(page);

    await guideLink.focus();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await expect(guideLink).toBeHidden();
  });

  test('바깥을 클릭하면 닫히고, 메뉴 링크로 이동하면 닫힌 뒤 h1로 초점이 이동한다', async ({
    page,
  }) => {
    await gotoAndWait(page, '/dashboard');

    const notifications = page.getByRole('button', { name: /^알림/ });
    await notifications.click();
    await expect(page.getByRole('button', { name: '모두 읽음' })).toBeVisible();
    await page.getByRole('heading', { level: 1 }).click();
    await expect(notifications).toHaveAttribute('aria-expanded', 'false');

    await page.getByRole('button', { name: '김데모 계정 메뉴' }).click();
    await page.getByRole('banner').getByRole('link', { name: 'UI 컴포넌트 가이드' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'UI 컴포넌트 가이드' })).toBeFocused();
    await expect(page.getByRole('button', { name: '김데모 계정 메뉴' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

test.describe('반응형: 페이지 전체 가로 스크롤 없음', () => {
  for (const width of [1920, 1440, 1280, 1024, 768, 375, 320]) {
    test(`${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const resource = await firstResource(page);
      await gotoAndWait(page, `/resources/${resource.id}`);
      await expect(page.getByRole('heading', { level: 1, name: resource.name })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }
});
