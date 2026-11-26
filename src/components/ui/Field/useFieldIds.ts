import { useId } from 'react';

import { cn } from '@/utils/cn';

interface FieldIdsOptions {
  id?: string;
  hasHint: boolean;
  hasError: boolean;
  /** 사용처에서 직접 준 aria-describedby(있으면 함께 연결한다) */
  describedBy?: string;
}

/** 라벨·도움말·오류 id를 만들고, 실제로 표시되는 요소만 aria-describedby로 연결한다. */
export function useFieldIds({ id, hasHint, hasError, describedBy }: FieldIdsOptions) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  // 오류를 먼저 읽게 한다. 수정해야 할 내용이 도움말보다 중요하다.
  const ariaDescribedBy = cn(hasError && errorId, hasHint && hintId, describedBy) || undefined;

  return { inputId, hintId, errorId, ariaDescribedBy };
}
