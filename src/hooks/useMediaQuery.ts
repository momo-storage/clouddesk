import { useCallback, useSyncExternalStore } from 'react';

/** 미디어 쿼리 일치 여부를 구독한다. 첫 렌더부터 실제 값을 쓰므로 레이아웃이 깜빡이지 않는다. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onChange);
      return () => {
        mediaQueryList.removeEventListener('change', onChange);
      };
    },
    [query],
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
