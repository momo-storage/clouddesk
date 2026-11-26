import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  message: string;
}

export interface ToastApi {
  /** 처리 결과를 알린다. 5초 뒤 자동으로 닫히며, 포인터·초점이 올라가 있는 동안에는 멈춘다. */
  showToast: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있습니다.');
  }
  return api;
}
