/**
 * 차트 공통 스타일. 모든 차트가 같은 색·축·격자 값을 쓰도록 한곳에 둔다.
 * 색은 디자인 토큰(CSS Custom Property)을 그대로 참조한다. 값과 대비는 docs/color-contrast.md에서 관리한다.
 */
export const CHART_COLOR = {
  aws: 'var(--color-chart-aws)',
  azure: 'var(--color-chart-azure)',
  gcp: 'var(--color-chart-gcp)',
  cpu: 'var(--color-chart-cpu)',
  memory: 'var(--color-chart-memory)',
  // 디스크는 CPU·메모리와 다른 차트에 따로 그리므로 기존 범주색(청록) 하나를 함께 쓴다.
  disk: 'var(--color-chart-gcp)',
  running: 'var(--color-success)',
  pending: 'var(--color-warning)',
  error: 'var(--color-danger)',
  stopped: 'var(--color-border-strong)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-danger)',
} as const;

/** 선·막대 하나의 정의. label은 범례·Tooltip·대체 데이터 표의 열 이름으로 함께 쓴다. */
export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

/** 범례 항목. 기준선처럼 점선으로 그리는 요소는 dashed로 표시한다. */
export interface LegendItem extends ChartSeries {
  dashed?: boolean;
}

/** 눈금 글자: 데이터보다 한 단계 약하게(보조 글자색, 12px) */
export const AXIS_TICK = { fill: 'var(--color-text-tertiary)', fontSize: 12 } as const;
export const TICK_MARGIN = 8;
/** 격자선: 값을 읽는 보조선이므로 옅은 점선으로 그린다. */
export const GRID_STROKE = 'var(--color-border)';
export const GRID_DASH = '3 3';
/** 축 기준선(0 위치)은 격자보다 진하게 그려 그래프의 바닥을 분명히 한다. */
export const BASELINE_STROKE = 'var(--color-border-strong)';
export const CURSOR_STROKE = 'var(--color-border-strong)';
export const LINE_WIDTH = 2;
/** 설계서 7-2: 모션은 150ms 이하. 차트 그리기 애니메이션은 끈다. */
export const ANIMATE = false;
