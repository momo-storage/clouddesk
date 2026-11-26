import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E·접근성 검사는 배포물과 같은 프로덕션 빌드(vite preview)를 대상으로 한다.
 * 개발 서버 전용 경고나 HMR 코드가 검사 결과에 섞이지 않게 하기 위해서다.
 *
 * 검증 기준 브라우저는 Chrome(Chromium) 하나다. 교차 브라우저 검증은 범위에서 제외했다(설계서 11장, 2026-11-26).
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
