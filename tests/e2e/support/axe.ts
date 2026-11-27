import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe 자동 접근성 검사(선택 실행).
 *
 * 2026-11-27 검증 범위 조정으로 axe 검사는 필수 검증에서 제외했다. 기능 테스트(`npm run test:e2e`)에서는
 * 이 함수가 아무것도 하지 않고, 필요할 때만 `npm run test:e2e:a11y`(Playwright 프로젝트 "a11y")로 실행한다.
 * 검사 코드는 지우지 않고 남겨 두어 나중에 다시 켤 수 있게 한다.
 */
export const A11Y_PROJECT = 'a11y';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export async function expectNoAxeViolations(page: Page, options: { include?: string } = {}) {
  if (test.info().project.name !== A11Y_PROJECT) return;
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (options.include) builder = builder.include(options.include);
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}
