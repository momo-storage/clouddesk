import type { ReactNode } from 'react';

import { DemoDataProvider } from '@/store/demoData/DemoDataProvider';
import { ToastProvider } from '@/store/toast/ToastProvider';

/** 앱 전역 Context Provider 모음 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DemoDataProvider>{children}</DemoDataProvider>
    </ToastProvider>
  );
}
