import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E·접근성 검사는 배포물과 같은 프로덕션 빌드(vite preview)를 대상으로 한다.
 * 개발 서버 전용 경고나 HMR 코드가 검사 결과에 섞이지 않게 하기 위해서다.
 *
 * 검증 기준 브라우저는 Chrome(Chromium) 하나다. 교차 브라우저 검증은 범위에서 제외했다(설계서 11장, 2026-11-26).
 *
 * 프로젝트
 * - chromium: 필수 기능 테스트(npm run test:e2e). axe 검사는 건너뛰고 @a11y 태그 테스트는 실행하지 않는다.
 * - a11y: 선택 실행(npm run test:e2e:a11y). 같은 테스트를 axe 검사까지 포함해 돌린다.
 *   axe 자동 검사는 2026-11-27 검증 범위 조정으로 필수 검증에서 제외했다(설계서 11장).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@a11y/ },
    { name: 'a11y', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
