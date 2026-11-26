import { withDelay } from './delay';
import { getSnapshot, saveSnapshot } from './repository';

/** 헤더 알림의 "모두 읽음". 변경된 이벤트 ID를 돌려준다. */
export function markAllEventsRead(): Promise<string[]> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    const unreadIds = snapshot.events.filter((event) => !event.read).map((event) => event.id);
    saveSnapshot({
      ...snapshot,
      events: snapshot.events.map((event) => (event.read ? event : { ...event, read: true })),
    });
    return unreadIds;
  });
}
