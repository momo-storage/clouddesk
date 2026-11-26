import { useEffect, useEffectEvent, useState } from 'react';

export type AsyncValue<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' };

/**
 * Mock 서비스처럼 Promise를 돌려주는 조회를 화면 상태로 바꾼다(차트 데이터 등).
 * key가 바뀔 때만 다시 조회하고, 결과가 오기 전까지 loading을 돌려준다.
 * 늦게 도착한 이전 조회 결과는 key가 다르므로 무시된다.
 */
export function useAsyncValue<T>(key: string, load: () => Promise<T>): AsyncValue<T> {
  const [result, setResult] = useState<{ key: string; value: AsyncValue<T> } | null>(null);
  // 사용처가 매 렌더링 새 함수를 넘겨도 다시 조회하지 않도록 최신 load만 참조한다.
  const runLoad = useEffectEvent(load);

  useEffect(() => {
    let ignore = false;
    runLoad()
      .then((data) => {
        if (!ignore) setResult({ key, value: { status: 'ready', data } });
      })
      .catch(() => {
        if (!ignore) setResult({ key, value: { status: 'error' } });
      });
    return () => {
      ignore = true;
    };
  }, [key]);

  return result?.key === key ? result.value : { status: 'loading' };
}
