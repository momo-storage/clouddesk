import { CircleAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { THRESHOLD_LABEL, getThresholdLevel } from '@/constants/thresholds';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

import styles from './UsageBar.module.scss';

export interface UsageBarProps {
  /** 사용률(%) 0~100 */
  value: number;
  /**
   * - compact(기본): 표 셀용 한 줄. 숫자 + 짧은 막대 + 상태
   * - full: 카드용. 위에 항목명·수치·상태, 아래에 영역 너비를 채우는 막대
   */
  variant?: 'compact' | 'full';
  /** full에서 위쪽에 보이는 항목명(예: "CPU") */
  label?: ReactNode;
  /** full에서 항목명 옆의 보조 정보(예: 디스크 용량) */
  meta?: ReactNode;
}

/**
 * 사용률: 숫자 + 막대 + 임계치 상태(경고·위험은 아이콘과 글자도 함께 표시).
 * 막대는 시각 보조이며 낭독기에는 숨긴다. 숫자와 상태 글자가 같은 정보를 전달한다.
 */
export function UsageBar({ value, variant = 'compact', label, meta }: UsageBarProps) {
  const level = getThresholdLevel(value);
  const Icon = level === 'critical' ? CircleAlert : TriangleAlert;
  const levelText = level !== 'normal' && (
    <span className={styles.level}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {THRESHOLD_LABEL[level]}
    </span>
  );
  const track = (
    <span className={styles.track} aria-hidden="true">
      <span className={styles.fill} style={{ width: `${String(Math.min(100, value))}%` }} />
    </span>
  );

  if (variant === 'full') {
    return (
      <div className={cn(styles.full, styles[level])}>
        <div className={styles.fullHead}>
          <span className={styles.fullLabel}>
            {label}
            {meta && <span className={styles.fullMeta}>{meta}</span>}
          </span>
          <span className={styles.fullValue}>
            {levelText}
            <span className={styles.value}>{formatPercent(value)}%</span>
          </span>
        </div>
        {track}
      </div>
    );
  }

  return (
    <span className={cn(styles.usage, styles[level])}>
      <span className={styles.value}>{formatPercent(value)}</span>
      {track}
      {levelText}
    </span>
  );
}
