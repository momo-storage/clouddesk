import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Field.module.scss';

export interface FieldProps {
  /** 입력 요소의 id(label의 htmlFor) */
  inputId: string;
  hintId: string;
  errorId: string;
  label: string;
  /** 검색창처럼 주변 맥락으로 용도가 분명할 때만 숨긴다. 숨겨도 label 요소는 남는다. */
  hideLabel?: boolean;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Input·Select가 함께 쓰는 라벨·도움말·오류 배치.
 * 연결(aria-describedby, aria-invalid)은 입력 요소 쪽에서 useFieldIds의 id로 처리한다.
 */
export function Field({
  inputId,
  hintId,
  errorId,
  label,
  hideLabel = false,
  required = false,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={inputId} className={cn(styles.label, hideLabel && styles.labelHidden)}>
        {label}
        {/* 필수 여부는 입력 요소의 required 속성이 전달하므로 별표는 시각 표시만 한다. */}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <CircleAlert size={14} className={styles.errorIcon} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
