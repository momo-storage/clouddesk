import type { ComponentProps, ReactNode } from 'react';

import { Field, fieldStyles, useFieldIds } from '@/components/ui/Field';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  /** 오류 문구. 있으면 aria-invalid와 aria-describedby로 입력 요소에 연결된다. */
  error?: ReactNode;
  /** 바깥 래퍼(라벨 포함)에 붙일 클래스 */
  fieldClassName?: string;
}

/** 텍스트 입력. label 요소와 도움말·오류 문구를 입력 요소에 연결한다. */
export function Input({
  id,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  fieldClassName,
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
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
      <input
        {...props}
        id={ids.inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.ariaDescribedBy}
        className={cn(fieldStyles.control, className)}
      />
    </Field>
  );
}
