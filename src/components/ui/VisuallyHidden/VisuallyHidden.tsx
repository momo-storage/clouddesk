import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/utils/cn';

import styles from './VisuallyHidden.module.scss';

export type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'>;

/** 화면에는 보이지 않고 화면 낭독기에는 읽히는 텍스트. 아이콘 단독 버튼의 이름 등에 쓴다. */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return <span className={cn(styles.root, className)} {...props} />;
}
