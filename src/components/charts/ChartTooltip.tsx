import type { TooltipPayloadEntry } from 'recharts';

import styles from './Charts.module.scss';

/** Recharts Tooltip이 content 함수에 넘기는 값 중 이 컴포넌트가 쓰는 것과 서식 함수 */
export interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipPayloadEntry[];
  label?: string | number;
  formatLabel: (label: string) => string;
  formatValue: (value: number) => string;
  /** 누적 막대처럼 항목의 합계를 함께 보여줄 때 */
  showTotal?: boolean;
}

/** 모든 차트가 같은 모양으로 쓰는 Tooltip(마우스 위치의 값 보기). 같은 값은 대체 데이터 표에도 있다. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatLabel,
  formatValue,
  showTotal = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((entry) => typeof entry.value === 'number');
  const total = entries.reduce((sum, entry) => sum + Number(entry.value), 0);

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{formatLabel(String(label ?? ''))}</p>
      <ul className={styles.tooltipList}>
        {entries.map((entry) => (
          <li key={String(entry.dataKey)} className={styles.tooltipRow}>
            <span className={styles.swatch} style={{ backgroundColor: entry.color }} />
            <span className={styles.tooltipName}>{entry.name}</span>
            <span className={styles.tooltipValue}>{formatValue(Number(entry.value))}</span>
          </li>
        ))}
        {showTotal && (
          <li className={styles.tooltipTotal}>
            <span className={styles.tooltipName}>합계</span>
            <span className={styles.tooltipValue}>{formatValue(total)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
