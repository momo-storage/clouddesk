/**
 * JS에서 레이아웃 모드를 판단할 때 쓰는 브레이크포인트(이하 폭, px).
 * src/styles/tokens/_breakpoints.scss와 같은 값을 유지한다.
 * 미디어 쿼리는 CSS Custom Property를 읽을 수 없어 두 곳에 값을 둔다.
 */
export const BREAKPOINTS = {
  lg: 1279,
  md: 1023,
  sm: 767,
  xs: 374,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export function maxWidthQuery(name: BreakpointName): string {
  return `(max-width: ${BREAKPOINTS[name]}px)`;
}
