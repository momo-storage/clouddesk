import type { CloudEvent } from '@/types/event';

import { createSeedSnapshot } from './seed';
import { readSnapshot, writeSnapshot, type DemoDataSnapshot } from './storage';

/** 이벤트는 최근 것부터 이 개수까지만 보관한다(localStorage 용량 보호). */
const MAX_EVENTS = 200;

/** 서비스가 검증에 실패했을 때 던지는 오류. message는 화면에 그대로 보여줄 수 있는 문장이다. */
export class DemoDataError extends Error {
  override name = 'DemoDataError';
}

/** 저장된 데이터가 있으면 그것을, 없으면 시드 데이터를 돌려준다. */
export function getSnapshot(): DemoDataSnapshot {
  return readSnapshot() ?? createSeedSnapshot();
}

/** 변경한 스냅샷을 저장한다. 이벤트는 최신순 정렬과 최대 개수를 맞춘다. */
export function saveSnapshot(snapshot: DemoDataSnapshot): DemoDataSnapshot {
  const events = [...snapshot.events]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, MAX_EVENTS);
  const next = { ...snapshot, events };
  writeSnapshot(next);
  return next;
}

/** 사용자 작업으로 생기는 이벤트. 실제 현재 시각을 쓴다. */
export function createActivityEvent(
  values: Pick<CloudEvent, 'resourceId' | 'resourceName' | 'provider' | 'severity' | 'message'>,
): CloudEvent {
  return {
    ...values,
    id: `evt-${crypto.randomUUID()}`,
    occurredAt: new Date().toISOString(),
    read: false,
  };
}
