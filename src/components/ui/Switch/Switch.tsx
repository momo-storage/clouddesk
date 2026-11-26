import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

import styles from './Switch.module.scss';

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'role' | 'size'> {
  label: string;
  onText?: string;
  offText?: string;
}

/**
 * 켜기/끄기 스위치. 네이티브 체크박스에 role="switch"를 더해 "스위치, 켬/끔"으로 전달한다.
 * 상태를 색과 위치만으로 표시하지 않도록 "켜짐/꺼짐" 문구를 함께 보여준다.
 * 문구는 화면 낭독기가 상태를 이미 읽으므로 aria-hidden 처리한다.
 */
export function Switch({
  label,
  onText = '켜짐',
  offText = '꺼짐',
  className,
  ...props
}: SwitchProps) {
  return (
    <label className={cn(styles.switch, className)}>
      <span className={styles.label}>{label}</span>
      <span className={styles.control}>
        <input type="checkbox" role="switch" className={styles.input} {...props} />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <span className={styles.stateOn} aria-hidden="true">
          {onText}
        </span>
        <span className={styles.stateOff} aria-hidden="true">
          {offText}
        </span>
      </span>
    </label>
  );
}
