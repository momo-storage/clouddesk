import type { ReactNode } from 'react';

import { ToastProvider } from '@/store/toast/ToastProvider';

/** 앱 전역 Context Provider 모음. Phase 2-5에서 리소스 데이터 Provider가 추가된다. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
