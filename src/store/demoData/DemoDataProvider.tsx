import { useEffect, useMemo, useReducer, type ReactNode } from 'react';

import * as demoDataService from '@/services/demoDataService';
import * as eventService from '@/services/eventService';
import * as resourceService from '@/services/resourceService';

import { DemoDataContext, type DemoDataActions } from './demoDataContext';
import { demoDataReducer, initialDemoDataState } from './demoDataReducer';

/**
 * 리소스·이벤트·사용자 데이터의 전역 상태(Context + useReducer).
 * 서비스가 localStorage를 읽고 쓰는 단일 원천이고, 이 Provider는 그 결과를 화면 상태로 보관한다.
 * 대시보드 수치·차트·비용 집계는 상태에서 services/dashboard.ts 함수로 계산한다.
 */
export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoDataReducer, initialDemoDataState);

  useEffect(() => {
    let ignore = false;
    demoDataService
      .loadDemoData()
      .then((snapshot) => {
        if (!ignore) dispatch({ type: 'loaded', snapshot });
      })
      .catch(() => {
        if (!ignore) dispatch({ type: 'loadFailed' });
      });
    // StrictMode의 두 번째 실행이나 언마운트 뒤 늦게 온 응답은 무시한다.
    return () => {
      ignore = true;
    };
  }, []);

  const actions = useMemo<DemoDataActions>(
    () => ({
      createResource: async (input) => {
        const { resource, event } = await resourceService.createResource(input);
        dispatch({ type: 'resourceSaved', resource, event });
        return resource;
      },
      updateResource: async (id, input) => {
        const { resource, event } = await resourceService.updateResource(id, input);
        dispatch({ type: 'resourceSaved', resource, event });
        return resource;
      },
      deleteResources: async (ids) => {
        const { deletedIds, events } = await resourceService.deleteResources(ids);
        dispatch({ type: 'resourcesDeleted', ids: deletedIds, events });
        return deletedIds;
      },
      markAllEventsRead: async () => {
        const ids = await eventService.markAllEventsRead();
        dispatch({ type: 'eventsRead', ids });
      },
      resetDemoData: async () => {
        dispatch({ type: 'loadStarted' });
        const snapshot = await demoDataService.resetDemoData();
        dispatch({ type: 'loaded', snapshot });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <DemoDataContext value={value}>{children}</DemoDataContext>;
}
