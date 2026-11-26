/**
 * 명도 대비 검사 스크립트
 *
 * src/styles/tokens/_color.scss를 Sass로 직접 컴파일해 토큰 값을 읽으므로, 토큰과 검사 대상이 항상 같은 원천을 쓴다.
 * 아래 COMBINATIONS에는 실제 화면에서 함께 쓰이는 전경색·배경색 조합만 둔다(설계서 8-3).
 *
 *   npm run check:contrast            결과 표 출력, 기준 미달이 있으면 종료 코드 1
 *   npm run check:contrast -- --write docs/color-contrast.md 갱신
 *
 * 비활성 요소(text-disabled 등)는 WCAG 예외이므로 대상에서 뺀다.
 * 계산식은 WCAG 2.x 상대 휘도 공식이다. 화면 구현 후에는 axe로 렌더링 결과를 한 번 더 확인한다.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as sass from 'sass';

type Kind = 'text' | 'non-text';

interface Combination {
  fg: string;
  bg: string;
  kind: Kind;
  usage: string;
}

/** WCAG 최소 기준: 일반 텍스트 4.5:1, 비텍스트(UI 경계·아이콘·초점 표시·차트 요소) 3:1 */
const MINIMUM: Record<Kind, number> = { text: 4.5, 'non-text': 3 };

const COMBINATIONS: Combination[] = [
  // 본문 글자 × 실제로 놓이는 배경
  ...(['text-primary', 'text-secondary', 'text-tertiary'] as const).flatMap((fg) =>
    (
      [
        ['bg', '본문 배경'],
        ['surface', '카드·테이블·사이드바'],
        ['surface-subtle', '테이블 헤더·중립 배지'],
        ['surface-hover', '호버 행·메뉴'],
        ['primary-subtle', '선택 행·활성 메뉴'],
      ] as const
    ).map(([bg, place]) => ({ fg, bg, kind: 'text' as const, usage: `${fg} 글자, ${place}` })),
  ),

  // 주요 색 글자(링크, 활성 메뉴, 정보 배지)
  { fg: 'primary', bg: 'surface', kind: 'text', usage: '링크(카드 위)' },
  { fg: 'primary', bg: 'bg', kind: 'text', usage: '링크(본문 배경 위)' },
  { fg: 'primary', bg: 'surface-hover', kind: 'text', usage: '링크(호버 행)' },
  { fg: 'primary', bg: 'primary-subtle', kind: 'text', usage: '활성 메뉴, 정보 배지' },
  { fg: 'primary-hover', bg: 'surface', kind: 'text', usage: '링크 호버' },

  // 채워진 버튼
  { fg: 'text-inverse', bg: 'primary', kind: 'text', usage: '주요 버튼' },
  { fg: 'text-inverse', bg: 'primary-hover', kind: 'text', usage: '주요 버튼 호버' },
  { fg: 'text-inverse', bg: 'danger', kind: 'text', usage: '위험 버튼' },
  { fg: 'text-inverse', bg: 'danger-hover', kind: 'text', usage: '위험 버튼 호버' },

  // 헤더
  { fg: 'header-text', bg: 'header-bg', kind: 'text', usage: '헤더 글자' },
  { fg: 'header-text', bg: 'header-hover', kind: 'text', usage: '헤더 버튼 호버' },
  { fg: 'header-text-muted', bg: 'header-bg', kind: 'text', usage: '헤더 보조 글자' },
  { fg: 'header-text-muted', bg: 'header-hover', kind: 'text', usage: '헤더 보조 글자(호버)' },

  // 상태 배지·상태 글자
  { fg: 'success', bg: 'success-bg', kind: 'text', usage: '성공·실행 중 배지' },
  { fg: 'success', bg: 'surface', kind: 'text', usage: '성공 글자(카드 위)' },
  { fg: 'warning', bg: 'warning-bg', kind: 'text', usage: '경고·전환 중 배지' },
  { fg: 'warning', bg: 'surface', kind: 'text', usage: '경고 글자(카드 위)' },
  { fg: 'danger', bg: 'danger-bg', kind: 'text', usage: '위험·오류 배지' },
  { fg: 'danger', bg: 'surface', kind: 'text', usage: '오류 메시지(폼)' },

  // 비텍스트: 입력 경계
  { fg: 'border-strong', bg: 'surface', kind: 'non-text', usage: '입력·체크박스 테두리(카드 위)' },
  { fg: 'border-strong', bg: 'bg', kind: 'non-text', usage: '입력 테두리(본문 배경 위)' },
  {
    fg: 'border-strong',
    bg: 'surface-subtle',
    kind: 'non-text',
    usage: '전체 선택 체크박스(테이블 헤더)',
  },
  {
    fg: 'border-strong',
    bg: 'primary-subtle',
    kind: 'non-text',
    usage: '체크박스 테두리(선택 행)',
  },
  { fg: 'primary', bg: 'surface', kind: 'non-text', usage: '선택된 체크박스·스위치 채움' },

  // 비텍스트: 초점 표시
  ...(['surface', 'bg', 'surface-subtle', 'surface-hover', 'primary-subtle'] as const).map(
    (bg) => ({
      fg: 'focus-ring',
      bg,
      kind: 'non-text' as const,
      usage: `초점 링, ${bg} 배경`,
    }),
  ),
  { fg: 'header-focus-ring', bg: 'header-bg', kind: 'non-text', usage: '헤더 초점 링' },
  { fg: 'header-focus-ring', bg: 'header-hover', kind: 'non-text', usage: '헤더 초점 링(호버)' },

  // 비텍스트: 차트 범주색
  { fg: 'chart-aws', bg: 'surface', kind: 'non-text', usage: '차트 AWS 계열' },
  { fg: 'chart-azure', bg: 'surface', kind: 'non-text', usage: '차트 Azure 계열' },
  { fg: 'chart-gcp', bg: 'surface', kind: 'non-text', usage: '차트 GCP 계열' },

  // Phase 2-4 공통 컴포넌트에서 새로 쓰는 조합
  { fg: 'header-text', bg: 'header-bg', kind: 'text', usage: 'Tooltip 글자' },
  { fg: 'text-primary', bg: 'surface-hover', kind: 'text', usage: 'Modal 하단 버튼 영역 글자' },
  { fg: 'text-inverse', bg: 'primary', kind: 'text', usage: 'Pagination 현재 페이지' },
  { fg: 'danger', bg: 'danger-bg', kind: 'text', usage: 'Dropdown 위험 항목 호버' },
  { fg: 'border-strong', bg: 'surface', kind: 'non-text', usage: 'Switch 꺼짐 트랙' },
  { fg: 'success', bg: 'surface', kind: 'non-text', usage: 'Toast 성공 아이콘·막대' },
  { fg: 'danger', bg: 'surface', kind: 'non-text', usage: 'Toast 오류 아이콘·막대' },
  { fg: 'primary', bg: 'surface', kind: 'non-text', usage: 'Toast 안내 아이콘·막대' },

  // Phase 3-1 대시보드 차트
  { fg: 'chart-cpu', bg: 'surface', kind: 'non-text', usage: '차트 CPU 선' },
  { fg: 'chart-memory', bg: 'surface', kind: 'non-text', usage: '차트 메모리 선' },
  { fg: 'success', bg: 'surface', kind: 'non-text', usage: '차트 실행 중 막대' },
  { fg: 'warning', bg: 'surface', kind: 'non-text', usage: '차트 전환 중 막대·경고 기준선' },
  { fg: 'danger', bg: 'surface', kind: 'non-text', usage: '차트 오류 막대·위험 기준선' },
  { fg: 'border-strong', bg: 'surface', kind: 'non-text', usage: '차트 중지됨 막대' },
  { fg: 'text-secondary', bg: 'surface', kind: 'text', usage: '차트 축 눈금 글자' },
];

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/** 색상 토큰 맵을 Sass로 컴파일해 { 이름: #rrggbb } 형태로 읽는다. */
function loadColorTokens(): Map<string, string> {
  const { css } = sass.compileString(
    `@use 'src/styles/tokens/color' as t;
     @use 'sass:color';
     :root { @each $name, $value in t.$color {
       @if color.alpha($value) == 1 { --#{$name}: #{$value}; }
     } }`,
    { loadPaths: [projectRoot], style: 'expanded' },
  );

  const tokens = new Map<string, string>();
  for (const match of css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6}|white|black)\b/gi)) {
    const [, name, value] = match;
    if (name && value) tokens.set(name, normalizeHex(value));
  }
  return tokens;
}

function normalizeHex(value: string): string {
  const named: Record<string, string> = { white: '#ffffff', black: '#000000' };
  const hex = named[value.toLowerCase()] ?? value.toLowerCase();
  if (hex.length === 4) {
    return `#${[...hex.slice(1)].map((char) => char + char).join('')}`;
  }
  return hex;
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const [lighter, darker] = [relativeLuminance(fg), relativeLuminance(bg)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

const tokens = loadColorTokens();

const rows = COMBINATIONS.map((combination) => {
  const fgHex = tokens.get(combination.fg);
  const bgHex = tokens.get(combination.bg);
  if (!fgHex || !bgHex) {
    throw new Error(`토큰을 찾을 수 없습니다: ${combination.fg} / ${combination.bg}`);
  }
  // 표시값(소수 둘째 자리)으로 판정하면 4.499가 4.50으로 보이며 통과하는 일이 생기므로 원래 값으로 판정한다.
  const ratio = contrastRatio(fgHex, bgHex);
  const minimum = MINIMUM[combination.kind];
  return { ...combination, fgHex, bgHex, ratio, minimum, pass: ratio >= minimum };
});

const failures = rows.filter((row) => !row.pass);

const table = [
  '| 용도 | 전경 | 배경 | 구분 | 대비 | 기준 | 결과 |',
  '| --- | --- | --- | --- | --: | --: | --- |',
  ...rows.map(
    (row) =>
      `| ${row.usage} | \`${row.fg}\` ${row.fgHex} | \`${row.bg}\` ${row.bgHex} | ${row.kind === 'text' ? '텍스트' : '비텍스트'} | ${row.ratio.toFixed(2)}:1 | ${row.minimum}:1 | ${row.pass ? '통과' : '**미달**'} |`,
  ),
].join('\n');

const summary = `${rows.length}개 조합 중 ${rows.length - failures.length}개 통과, ${failures.length}개 미달`;

console.log(table);
console.log(`\n${summary}`);

if (process.argv.includes('--write')) {
  const outputPath = fileURLToPath(new URL('../docs/color-contrast.md', import.meta.url));
  const document = `# 색상 명도 대비 검증 결과

> 이 문서는 \`npm run check:contrast -- --write\`로 생성합니다. 직접 수정하지 마세요.

- 원천: \`src/styles/tokens/_color.scss\`
- 계산: WCAG 2.x 상대 휘도 공식. 텍스트 4.5:1, 비텍스트 3:1 기준
- 대상: 실제 화면에서 함께 쓰이는 전경색·배경색 조합(설계서 8-3). 비활성 요소는 WCAG 예외라 제외
- 한계: 토큰 값끼리의 계산입니다. 투명도·그림자·이미지 위 글자 등 렌더링 결과는 화면 구현 후 axe와 수동 검사로 확인합니다.

**${summary}**

${table}
`;
  writeFileSync(outputPath, document);
  console.log(`\n${outputPath}에 저장했습니다.`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
