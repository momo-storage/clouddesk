import { useCallback, useState } from 'react';

/**
 * localStorage에 JSON으로 저장되는 상태.
 * 저장된 값이 손상되었거나 형식이 바뀐 경우를 대비해 isValid로 검사하고, 통과하지 못하면 fallback을 쓴다.
 * 사생활 보호 모드 등에서 저장소 접근이 실패해도 화면 상태는 정상 동작한다.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback, isValid));

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 저장소를 쓸 수 없는 환경에서는 현재 세션 상태만 유지한다.
      }
    },
    [key],
  );

  return [value, update];
}

function readStorage<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
