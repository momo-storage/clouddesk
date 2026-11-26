/**
 * 시드 기반 의사 난수. 같은 시드면 항상 같은 값을 만들어, 새로고침해도 Mock 데이터가 바뀌지 않는다.
 * (Math.random을 쓰면 새로고침마다 데이터가 달라진다.)
 */

/** 문자열을 32비트 정수로 바꾼다(FNV-1a). 리소스 ID 등을 시드로 쓸 때 사용한다. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface SeededRandom {
  /** 0 이상 1 미만 */
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number, digits?: number) => number;
  pick: <T>(items: readonly T[]) => T;
  chance: (probability: number) => boolean;
  hex: (length: number) => string;
}

/** mulberry32 알고리즘 */
export function createRandom(seed: number): SeededRandom {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;

  return {
    next,
    int,
    float: (min, max, digits = 1) => Number((next() * (max - min) + min).toFixed(digits)),
    pick: (items) => {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('빈 배열에서는 값을 고를 수 없습니다.');
      return item;
    },
    chance: (probability) => next() < probability,
    hex: (length) => Array.from({ length }, () => Math.floor(next() * 16).toString(16)).join(''),
  };
}
