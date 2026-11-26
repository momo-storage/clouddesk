import { cn } from '@/utils/cn';

import type { LegendItem } from './chartTheme';
import styles from './Charts.module.scss';

export interface ChartLegendProps {
  items: LegendItem[];
}

/**
 * 차트 위 왼쪽 범례(설계서 7-4). 색 견본과 함께 이름을 글자로 보여준다.
 * 차트 그림은 낭독기에서 숨기므로 범례도 숨기고, 같은 정보는 요약 문장과 대체 데이터 표로 전달한다.
 */
export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className={styles.legend} aria-hidden="true">
      {items.map((item) => (
        <li key={item.key} className={styles.legendItem}>
          {item.dashed ? (
            <span className={styles.swatchDashed} style={{ borderColor: item.color }} />
          ) : (
            <span className={cn(styles.swatch)} style={{ backgroundColor: item.color }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
