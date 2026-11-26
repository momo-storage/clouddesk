import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Badge.module.scss';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  /** 상태를 색에만 의존하지 않도록 상태 배지에는 아이콘을 함께 쓴다. */
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

/** 상태·제공업체·역할 등 짧은 분류 표시. 상태 값과의 매핑은 StatusBadge(데이터 컴포넌트)가 맡는다. */
export function Badge({ tone = 'neutral', icon: Icon, className, children }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], className)}>
      {Icon && <Icon size={12} strokeWidth={2.5} className={styles.icon} aria-hidden="true" />}
      {children}
    </span>
  );
}
