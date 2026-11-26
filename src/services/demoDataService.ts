import { withDelay } from './delay';
import { getSnapshot, saveSnapshot } from './repository';
import { createSeedSnapshot } from './seed';
import { clearSnapshot, type DemoDataSnapshot } from './storage';

/** 앱 시작 시 데이터 불러오기. 처음 방문이면 시드 데이터를 저장해 두고 돌려준다. */
export function loadDemoData(): Promise<DemoDataSnapshot> {
  return withDelay(() => saveSnapshot(getSnapshot()));
}

/** 데모 데이터 초기화: 이 브라우저에 저장된 변경 내용을 지우고 시드 상태로 되돌린다. */
export function resetDemoData(): Promise<DemoDataSnapshot> {
  return withDelay(() => {
    clearSnapshot();
    return saveSnapshot(createSeedSnapshot());
  });
}
