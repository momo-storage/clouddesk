import { cn } from '@/utils/cn';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 아이콘만 보이는 정사각형 버튼. 텍스트(children)는 화면 낭독기용 이름으로 남는다. */
  iconOnly?: boolean;
}

/** 버튼 모양을 다른 요소(링크, Dropdown 트리거)에 입힐 때 쓴다. */
export function getButtonClassName({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
}: ButtonStyleOptions = {}): string {
  return cn(styles.button, styles[variant], styles[size], iconOnly && styles.iconOnly);
}

export const buttonIconClassName = styles.icon;
export const buttonSpinnerClassName = styles.spinner;
