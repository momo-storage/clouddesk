# 색상 명도 대비 검증 결과

> 이 문서는 `npm run check:contrast -- --write`로 생성합니다. 직접 수정하지 마세요.

- 원천: `src/styles/tokens/_color.scss`
- 계산: WCAG 2.x 상대 휘도 공식. 텍스트 4.5:1, 비텍스트 3:1 기준
- 대상: 실제 화면에서 함께 쓰이는 전경색·배경색 조합(설계서 8-3). 비활성 요소는 WCAG 예외라 제외
- 한계: 토큰 값끼리의 계산입니다. 투명도·그림자·이미지 위 글자 등 렌더링 결과는 화면 구현 후 axe와 수동 검사로 확인합니다.

**64개 조합 중 64개 통과, 0개 미달**

| 용도 | 전경 | 배경 | 구분 | 대비 | 기준 | 결과 |
| --- | --- | --- | --- | --: | --: | --- |
| text-primary 글자, 본문 배경 | `text-primary` #1b2230 | `bg` #f4f6f9 | 텍스트 | 14.72:1 | 4.5:1 | 통과 |
| text-primary 글자, 카드·테이블·사이드바 | `text-primary` #1b2230 | `surface` #ffffff | 텍스트 | 15.93:1 | 4.5:1 | 통과 |
| text-primary 글자, 테이블 헤더·중립 배지 | `text-primary` #1b2230 | `surface-subtle` #eef1f5 | 텍스트 | 14.06:1 | 4.5:1 | 통과 |
| text-primary 글자, 호버 행·메뉴 | `text-primary` #1b2230 | `surface-hover` #f6f8fb | 텍스트 | 14.98:1 | 4.5:1 | 통과 |
| text-primary 글자, 선택 행·활성 메뉴 | `text-primary` #1b2230 | `primary-subtle` #eaf0fd | 텍스트 | 13.95:1 | 4.5:1 | 통과 |
| text-secondary 글자, 본문 배경 | `text-secondary` #4a5363 | `bg` #f4f6f9 | 텍스트 | 7.16:1 | 4.5:1 | 통과 |
| text-secondary 글자, 카드·테이블·사이드바 | `text-secondary` #4a5363 | `surface` #ffffff | 텍스트 | 7.75:1 | 4.5:1 | 통과 |
| text-secondary 글자, 테이블 헤더·중립 배지 | `text-secondary` #4a5363 | `surface-subtle` #eef1f5 | 텍스트 | 6.84:1 | 4.5:1 | 통과 |
| text-secondary 글자, 호버 행·메뉴 | `text-secondary` #4a5363 | `surface-hover` #f6f8fb | 텍스트 | 7.29:1 | 4.5:1 | 통과 |
| text-secondary 글자, 선택 행·활성 메뉴 | `text-secondary` #4a5363 | `primary-subtle` #eaf0fd | 텍스트 | 6.79:1 | 4.5:1 | 통과 |
| text-tertiary 글자, 본문 배경 | `text-tertiary` #646d7c | `bg` #f4f6f9 | 텍스트 | 4.82:1 | 4.5:1 | 통과 |
| text-tertiary 글자, 카드·테이블·사이드바 | `text-tertiary` #646d7c | `surface` #ffffff | 텍스트 | 5.22:1 | 4.5:1 | 통과 |
| text-tertiary 글자, 테이블 헤더·중립 배지 | `text-tertiary` #646d7c | `surface-subtle` #eef1f5 | 텍스트 | 4.61:1 | 4.5:1 | 통과 |
| text-tertiary 글자, 호버 행·메뉴 | `text-tertiary` #646d7c | `surface-hover` #f6f8fb | 텍스트 | 4.91:1 | 4.5:1 | 통과 |
| text-tertiary 글자, 선택 행·활성 메뉴 | `text-tertiary` #646d7c | `primary-subtle` #eaf0fd | 텍스트 | 4.57:1 | 4.5:1 | 통과 |
| 링크(카드 위) | `primary` #1d4ed8 | `surface` #ffffff | 텍스트 | 6.70:1 | 4.5:1 | 통과 |
| 링크(본문 배경 위) | `primary` #1d4ed8 | `bg` #f4f6f9 | 텍스트 | 6.19:1 | 4.5:1 | 통과 |
| 링크(호버 행) | `primary` #1d4ed8 | `surface-hover` #f6f8fb | 텍스트 | 6.30:1 | 4.5:1 | 통과 |
| 활성 메뉴, 정보 배지 | `primary` #1d4ed8 | `primary-subtle` #eaf0fd | 텍스트 | 5.87:1 | 4.5:1 | 통과 |
| 링크 호버 | `primary-hover` #1e40af | `surface` #ffffff | 텍스트 | 8.72:1 | 4.5:1 | 통과 |
| 주요 버튼 | `text-inverse` #ffffff | `primary` #1d4ed8 | 텍스트 | 6.70:1 | 4.5:1 | 통과 |
| 주요 버튼 호버 | `text-inverse` #ffffff | `primary-hover` #1e40af | 텍스트 | 8.72:1 | 4.5:1 | 통과 |
| 위험 버튼 | `text-inverse` #ffffff | `danger` #b4232a | 텍스트 | 6.53:1 | 4.5:1 | 통과 |
| 위험 버튼 호버 | `text-inverse` #ffffff | `danger-hover` #8f1c22 | 텍스트 | 8.91:1 | 4.5:1 | 통과 |
| 헤더 글자 | `header-text` #ffffff | `header-bg` #13213c | 텍스트 | 16.02:1 | 4.5:1 | 통과 |
| 헤더 버튼 호버 | `header-text` #ffffff | `header-hover` #22324f | 텍스트 | 12.83:1 | 4.5:1 | 통과 |
| 헤더 보조 글자 | `header-text-muted` #aeb8cc | `header-bg` #13213c | 텍스트 | 8.03:1 | 4.5:1 | 통과 |
| 헤더 보조 글자(호버) | `header-text-muted` #aeb8cc | `header-hover` #22324f | 텍스트 | 6.43:1 | 4.5:1 | 통과 |
| 성공·실행 중 배지 | `success` #1a7f37 | `success-bg` #e8f5ec | 텍스트 | 4.52:1 | 4.5:1 | 통과 |
| 성공 글자(카드 위) | `success` #1a7f37 | `surface` #ffffff | 텍스트 | 5.08:1 | 4.5:1 | 통과 |
| 경고·전환 중 배지 | `warning` #8a5a00 | `warning-bg` #fff4d6 | 텍스트 | 5.41:1 | 4.5:1 | 통과 |
| 경고 글자(카드 위) | `warning` #8a5a00 | `surface` #ffffff | 텍스트 | 5.93:1 | 4.5:1 | 통과 |
| 위험·오류 배지 | `danger` #b4232a | `danger-bg` #fdecec | 텍스트 | 5.72:1 | 4.5:1 | 통과 |
| 오류 메시지(폼) | `danger` #b4232a | `surface` #ffffff | 텍스트 | 6.53:1 | 4.5:1 | 통과 |
| 입력·체크박스 테두리(카드 위) | `border-strong` #7d8796 | `surface` #ffffff | 비텍스트 | 3.63:1 | 3:1 | 통과 |
| 입력 테두리(본문 배경 위) | `border-strong` #7d8796 | `bg` #f4f6f9 | 비텍스트 | 3.36:1 | 3:1 | 통과 |
| 전체 선택 체크박스(테이블 헤더) | `border-strong` #7d8796 | `surface-subtle` #eef1f5 | 비텍스트 | 3.21:1 | 3:1 | 통과 |
| 체크박스 테두리(선택 행) | `border-strong` #7d8796 | `primary-subtle` #eaf0fd | 비텍스트 | 3.18:1 | 3:1 | 통과 |
| 선택된 체크박스·스위치 채움 | `primary` #1d4ed8 | `surface` #ffffff | 비텍스트 | 6.70:1 | 3:1 | 통과 |
| 초점 링, surface 배경 | `focus-ring` #1d4ed8 | `surface` #ffffff | 비텍스트 | 6.70:1 | 3:1 | 통과 |
| 초점 링, bg 배경 | `focus-ring` #1d4ed8 | `bg` #f4f6f9 | 비텍스트 | 6.19:1 | 3:1 | 통과 |
| 초점 링, surface-subtle 배경 | `focus-ring` #1d4ed8 | `surface-subtle` #eef1f5 | 비텍스트 | 5.92:1 | 3:1 | 통과 |
| 초점 링, surface-hover 배경 | `focus-ring` #1d4ed8 | `surface-hover` #f6f8fb | 비텍스트 | 6.30:1 | 3:1 | 통과 |
| 초점 링, primary-subtle 배경 | `focus-ring` #1d4ed8 | `primary-subtle` #eaf0fd | 비텍스트 | 5.87:1 | 3:1 | 통과 |
| 헤더 초점 링 | `header-focus-ring` #7fb0ff | `header-bg` #13213c | 비텍스트 | 7.29:1 | 3:1 | 통과 |
| 헤더 초점 링(호버) | `header-focus-ring` #7fb0ff | `header-hover` #22324f | 비텍스트 | 5.84:1 | 3:1 | 통과 |
| 차트 AWS 계열 | `chart-aws` #c2410c | `surface` #ffffff | 비텍스트 | 5.18:1 | 3:1 | 통과 |
| 차트 Azure 계열 | `chart-azure` #2563eb | `surface` #ffffff | 비텍스트 | 5.17:1 | 3:1 | 통과 |
| 차트 GCP 계열 | `chart-gcp` #0f766e | `surface` #ffffff | 비텍스트 | 5.47:1 | 3:1 | 통과 |
| Tooltip 글자 | `header-text` #ffffff | `header-bg` #13213c | 텍스트 | 16.02:1 | 4.5:1 | 통과 |
| Modal 하단 버튼 영역 글자 | `text-primary` #1b2230 | `surface-hover` #f6f8fb | 텍스트 | 14.98:1 | 4.5:1 | 통과 |
| Pagination 현재 페이지 | `text-inverse` #ffffff | `primary` #1d4ed8 | 텍스트 | 6.70:1 | 4.5:1 | 통과 |
| Dropdown 위험 항목 호버 | `danger` #b4232a | `danger-bg` #fdecec | 텍스트 | 5.72:1 | 4.5:1 | 통과 |
| Switch 꺼짐 트랙 | `border-strong` #7d8796 | `surface` #ffffff | 비텍스트 | 3.63:1 | 3:1 | 통과 |
| Toast 성공 아이콘·막대 | `success` #1a7f37 | `surface` #ffffff | 비텍스트 | 5.08:1 | 3:1 | 통과 |
| Toast 오류 아이콘·막대 | `danger` #b4232a | `surface` #ffffff | 비텍스트 | 6.53:1 | 3:1 | 통과 |
| Toast 안내 아이콘·막대 | `primary` #1d4ed8 | `surface` #ffffff | 비텍스트 | 6.70:1 | 3:1 | 통과 |
| 차트 CPU 선 | `chart-cpu` #1d4ed8 | `surface` #ffffff | 비텍스트 | 6.70:1 | 3:1 | 통과 |
| 차트 메모리 선 | `chart-memory` #7c3aed | `surface` #ffffff | 비텍스트 | 5.70:1 | 3:1 | 통과 |
| 차트 실행 중 막대 | `success` #1a7f37 | `surface` #ffffff | 비텍스트 | 5.08:1 | 3:1 | 통과 |
| 차트 전환 중 막대·경고 기준선 | `warning` #8a5a00 | `surface` #ffffff | 비텍스트 | 5.93:1 | 3:1 | 통과 |
| 차트 오류 막대·위험 기준선 | `danger` #b4232a | `surface` #ffffff | 비텍스트 | 6.53:1 | 3:1 | 통과 |
| 차트 중지됨 막대 | `border-strong` #7d8796 | `surface` #ffffff | 비텍스트 | 3.63:1 | 3:1 | 통과 |
| 차트 축 눈금 글자 | `text-secondary` #4a5363 | `surface` #ffffff | 텍스트 | 7.75:1 | 4.5:1 | 통과 |
