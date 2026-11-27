import type { DemoDataSnapshot } from '@/services/storage';
import type { CloudEvent } from '@/types/event';
import type { Resource } from '@/types/resource';

export interface DemoDataState extends DemoDataSnapshot {
  /** loading: 최초 불러오기·초기화 중 / ready: 사용 가능 / error: 불러오기 실패 */
  status: 'loading' | 'ready' | 'error';
}

export type DemoDataAction =
  | { type: 'loadStarted' }
  | { type: 'loaded'; snapshot: DemoDataSnapshot }
  | { type: 'loadFailed' }
  | { type: 'resourceSaved'; resource: Resource; event: CloudEvent }
  | { type: 'resourcesDeleted'; ids: string[]; events: CloudEvent[] }
  | { type: 'eventsRead'; ids: string[] };

export const initialDemoDataState: DemoDataState = {
  status: 'loading',
  resources: [],
  events: [],
  users: [],
};

/** 등록·수정을 하나로 처리한다: 같은 ID가 있으면 바꾸고, 없으면 맨 앞에 넣는다. */
function upsert<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];
}

/**
 * 서비스(저장소)에 반영된 결과를 화면 상태에 옮긴다. 계산·검증은 서비스가 하고 리듀서는 상태만 바꾼다.
 * 이벤트는 항상 최신순으로 유지한다(새 이벤트를 앞에 넣는다).
 */
export function demoDataReducer(state: DemoDataState, action: DemoDataAction): DemoDataState {
  switch (action.type) {
    case 'loadStarted':
      return { ...state, status: 'loading' };
    case 'loaded':
      return { status: 'ready', ...action.snapshot };
    case 'loadFailed':
      return { ...state, status: 'error' };
    case 'resourceSaved':
      return {
        ...state,
        resources: upsert(state.resources, action.resource),
        events: [action.event, ...state.events],
      };
    case 'resourcesDeleted':
      return {
        ...state,
        resources: state.resources.filter((resource) => !action.ids.includes(resource.id)),
        events: [...action.events, ...state.events],
      };
    case 'eventsRead':
      return {
        ...state,
        events: state.events.map((event) =>
          action.ids.includes(event.id) ? { ...event, read: true } : event,
        ),
      };
  }
}
