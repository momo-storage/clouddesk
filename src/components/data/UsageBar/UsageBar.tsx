import { CircleAlert, TriangleAlert } from 'lucide-react';

import { THRESHOLD_LABEL, getThresholdLevel } from '@/constants/thresholds';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

import styles from './UsageBar.module.scss';

export interface UsageBarProps {
  /** 사용률(%) 0~100 */
  value: number;
}

/**
 * 사용률: 숫자 + 막대 + 임계치 상태(경고·위험은 아이콘과 글자도 함께 표시).
 * 막대는 시각 보조이며 낭독기에는 숨긴다. 숫자와 상태 글자가 같은 정보를 전달한다.
 */
export function UsageBar({ value }: UsageBarProps) {
  const level = getThresholdLevel(value);
  const Icon = level === 'critical' ? CircleAlert : TriangleAlert;

  return (
    <span className={cn(styles.usage, styles[level])}>
      <span className={styles.value}>{formatPercent(value)}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ width: `${String(Math.min(100, value))}%` }} />
      </span>
      {level !== 'normal' && (
        <span className={styles.level}>
          <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
          {THRESHOLD_LABEL[level]}
        </span>
      )}
    </span>
  );
}
