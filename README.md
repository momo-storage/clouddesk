# CloudDesk

AWS, Microsoft Azure, Google Cloud Platform을 함께 관리하는 기업용 CMP(Cloud Management Platform) UI 포트폴리오입니다.
실제 클라우드 API나 백엔드와 연동하지 않으며, Mock Data로 동작하는 데모입니다.

> 이 문서는 개발 초기(Phase 2-1) 상태입니다. 프로젝트 소개, 설계 의도, 접근성 적용 사항, 품질 검증 결과 등 전체 내용은 Phase 6에서 작성합니다.

## 요구 환경

- Node.js 26 LTS (`.nvmrc` 참고, `26.13.1`에서 검증)
- npm 11 이상

## 실행 방법

```bash
npm install
npm run dev          # 개발 서버: http://localhost:5173
```

## 주요 스크립트

| 명령                     | 설명                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`            | Vite 개발 서버 실행                                                       |
| `npm run build`          | 타입 검사 후 프로덕션 빌드(`dist/`)                                       |
| `npm run preview`        | 빌드 결과 미리보기: http://localhost:4173                                 |
| `npm run typecheck`      | TypeScript 타입 검사                                                      |
| `npm run lint`           | ESLint 검사                                                               |
| `npm run format`         | Prettier로 서식 정리 (`format:check`는 검사만)                            |
| `npm run test:e2e`       | Playwright E2E 및 axe 자동 접근성 검사                                    |
| `npm run check:contrast` | 색상 토큰의 명도 대비 검사 (`-- --write`로 `docs/color-contrast.md` 갱신) |
| `npm run check:data`     | Mock 데이터 규칙(수량·관계·결정성)과 데이터 서비스 등록·수정·삭제 검사    |

E2E 테스트는 Chrome(Chromium)을 기준으로 실행합니다. 처음 실행하기 전에 브라우저를 설치합니다.

```bash
npx playwright install chromium
```
