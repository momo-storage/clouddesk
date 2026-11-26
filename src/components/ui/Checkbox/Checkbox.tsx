import { Check, Minus } from 'lucide-react';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Checkbox.module.scss';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size' | 'ref'> {
  label: ReactNode;
  /** 테이블 행 선택처럼 열 머리글로 의미가 분명할 때 라벨을 숨긴다. 이름은 화면 낭독기에 그대로 전달된다. */
  hideLabel?: boolean;
  /** 일부 선택 상태(전체 선택 체크박스). 화면 낭독기에는 "혼합"으로 전달된다. */
  indeterminate?: boolean;
}

/**
 * 네이티브 체크박스를 시각적으로만 감추고 모양을 새로 그린다.
 * input이 실제로 초점·클릭·키보드(Space)를 받으므로 접근성 동작은 브라우저 기본 그대로다.
 */
export function Checkbox({
  label,
  hideLabel = false,
  indeterminate = false,
  className,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // indeterminate는 HTML 속성이 없고 DOM 프로퍼티로만 설정할 수 있다.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cn(styles.checkbox, className)}>
      <input ref={inputRef} type="checkbox" className={styles.input} {...props} />
      <span className={styles.box} aria-hidden="true">
        <Check size={12} strokeWidth={3} className={styles.checkIcon} />
        <Minus size={12} strokeWidth={3} className={styles.minusIcon} />
      </span>
      <span className={hideLabel ? styles.labelHidden : styles.label}>{label}</span>
    </label>
  );
}
