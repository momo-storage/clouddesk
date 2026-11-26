import { MOCK_DELAY_RANGE } from '@/constants/demo';

/**
 * 네트워크 응답처럼 300~600ms 뒤에 결과를 돌려준다(로딩 상태 확인용).
 * 지연 시간만 무작위이며 데이터 값에는 영향을 주지 않는다.
 */
export function withDelay<T>(produce: () => T): Promise<T> {
  const { min, max } = MOCK_DELAY_RANGE;
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(produce());
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }, ms);
  });
}
