import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Field, fieldStyles, useFieldIds } from '@/components/ui/Field';
import { cn } from '@/utils/cn';

import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size' | 'children'> {
  label: string;
  options: SelectOption[];
  /** 값이 없을 때 보여줄 첫 항목(예: "전체", "선택하세요"). value는 빈 문자열이다. */
  placeholder?: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  fieldClassName?: string;
}

/**
 * 네이티브 select. 커스텀 콤보박스를 만들지 않고 화살표 모양만 바꾼다(설계서 6-1).
 * 키보드 동작과 화면 낭독기 지원은 브라우저 기본 동작을 그대로 쓴다.
 */
export function Select({
  id,
  label,
  options,
  placeholder,
  hideLabel,
  hint,
  error,
  required,
  className,
  fieldClassName,
  'aria-describedby': describedBy,
  ...props
}: SelectProps) {
  const ids = useFieldIds({ id, hasHint: !!hint, hasError: !!error, describedBy });

  return (
    <Field
      {...ids}
      label={label}
      hideLabel={hideLabel}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <div className={styles.wrapper}>
        <select
          {...props}
          id={ids.inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.ariaDescribedBy}
          className={cn(fieldStyles.control, styles.select, className)}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
      </div>
    </Field>
  );
}
