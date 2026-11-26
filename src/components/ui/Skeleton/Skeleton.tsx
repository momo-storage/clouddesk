import type { CSSProperties } from 'react';

import { cn } from '@/utils/cn';

import styles from './Skeleton.module.scss';

export interface SkeletonProps {
  /** text: 글자 높이의 한 줄, block: 카드·차트 등 영역 */
  variant?: 'text' | 'block';
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

/**
 * 로딩 중 자리 표시. 모양만 보여주므로 화면 낭독기에서는 숨긴다.
 * 로딩 상태는 감싸는 영역에 aria-busy="true"와 숨김 텍스트("불러오는 중")로 전달한다.
 */
export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height }}
    />
  );
}
