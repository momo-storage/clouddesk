import { createContext, useContext } from 'react';

import type { Resource, ResourceInput } from '@/types/resource';
import type { User, UserInput } from '@/types/user';

import type { DemoDataState } from './demoDataReducer';

/**
 * 화면에서 쓰는 데이터 작업. 모두 서비스(localStorage 반영)가 끝난 뒤 상태를 바꾼다.
 * 검증 실패 시 DemoDataError를 던지므로 화면에서 메시지를 보여준다.
 */
export interface DemoDataActions {
  createResource: (input: ResourceInput) => Promise<Resource>;
  updateResource: (id: string, input: ResourceInput) => Promise<Resource>;
  deleteResources: (ids: string[]) => Promise<string[]>;
  markAllEventsRead: () => Promise<void>;
  createUser: (input: UserInput) => Promise<User>;
  updateUser: (id: string, input: UserInput) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  /** 이 브라우저에 저장된 변경을 지우고 시드 데이터로 되돌린다. */
  resetDemoData: () => Promise<void>;
}

export interface DemoDataContextValue {
  state: DemoDataState;
  actions: DemoDataActions;
}

export const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function useDemoData(): DemoDataContextValue {
  const value = useContext(DemoDataContext);
  if (!value) {
    throw new Error('useDemoData는 DemoDataProvider 안에서만 사용할 수 있습니다.');
  }
  return value;
}
