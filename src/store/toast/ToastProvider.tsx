import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { ToastRegion } from '@/components/ui/Toast';

import { ToastContext, type ToastApi, type ToastMessage, type ToastTone } from './toastContext';

/** 한 번에 보여줄 최대 개수. 오래된 알림부터 정리해 화면을 가리지 않게 한다. */
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, tone, message }].slice(-MAX_TOASTS));
  }, []);

  const api = useMemo<ToastApi>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={api}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}
