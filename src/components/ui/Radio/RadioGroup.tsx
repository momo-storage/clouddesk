import { CircleAlert } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './RadioGroup.module.scss';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  /** 그룹 이름(fieldset의 legend) */
  legend: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * fieldset + legend로 묶은 네이티브 라디오 버튼.
 * 화살표 키로 선택을 옮기는 동작은 같은 name을 가진 네이티브 라디오가 기본 제공한다.
 */
export function RadioGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
  hint,
  error,
  required = false,
  disabled = false,
  orientation = 'horizontal',
}: RadioGroupProps<T>) {
  const baseId = useId();
  const groupName = name ?? baseId;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  const describedBy = cn(!!error && errorId, !!hint && hintId) || undefined;

  // 오류는 그룹(fieldset)의 설명으로 연결한다. radio 역할은 aria-invalid를 지원하지 않는다.
  return (
    <fieldset
      className={cn(styles.fieldset, !!error && styles.invalid)}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      <legend className={styles.legend}>
        {legend}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className={cn(styles.options, orientation === 'vertical' && styles.vertical)}>
        {options.map((option) => (
          <label key={option.value} className={styles.radio}>
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              required={required}
              onChange={() => {
                onChange(option.value);
              }}
            />
            <span className={styles.circle} aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
