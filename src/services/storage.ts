import { DEMO_STORAGE_KEY, DEMO_STORAGE_VERSION } from '@/constants/demo';
import type { CloudEvent } from '@/types/event';
import type { Resource } from '@/types/resource';
import type { User } from '@/types/user';

/** localStorage에 저장하는 데모 데이터. 시계열·비용·보안 규칙은 계산으로 만들므로 저장하지 않는다. */
export interface DemoDataSnapshot {
  resources: Resource[];
  events: CloudEvent[];
  users: User[];
}

interface StoredPayload extends DemoDataSnapshot {
  version: number;
}

function isStoredPayload(value: unknown): value is StoredPayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as Partial<StoredPayload>;
  return (
    payload.version === DEMO_STORAGE_VERSION &&
    Array.isArray(payload.resources) &&
    Array.isArray(payload.events) &&
    Array.isArray(payload.users)
  );
}

/**
 * 저장된 데이터를 읽는다. 없거나, 손상됐거나, 이전 버전 구조면 null을 돌려준다(사용처가 시드로 다시 시작).
 * 사생활 보호 모드 등에서 저장소를 쓸 수 없어도 오류 없이 시드 데이터로 동작한다.
 */
export function readSnapshot(): DemoDataSnapshot | null {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredPayload(parsed)) return null;
    return { resources: parsed.resources, events: parsed.events, users: parsed.users };
  } catch {
    return null;
  }
}

export function writeSnapshot(snapshot: DemoDataSnapshot): void {
  try {
    const payload: StoredPayload = { version: DEMO_STORAGE_VERSION, ...snapshot };
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 저장할 수 없는 환경에서는 화면 상태만 유지한다(새로고침하면 시드로 돌아간다).
  }
}

export function clearSnapshot(): void {
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // 저장소 접근 불가: 지울 데이터도 없다.
  }
}
