import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import type { ToastMessage, ToastTone } from '@/store/toast/toastContext';
import { cn } from '@/utils/cn';

import styles from './Toast.module.scss';

const DURATION_MS = 5000;

const TONE: Record<ToastTone, { icon: LucideIcon; label: string }> = {
  success: { icon: CircleCheck, label: '성공' },
  error: { icon: CircleAlert, label: '오류' },
  info: { icon: Info, label: '안내' },
};

interface ToastItemProps {
  toast: ToastMessage;
  /** 자동 닫힘(초점을 옮기지 않는다) */
  onDismiss: (id: number) => void;
  /** 사용자가 닫기 버튼으로 닫음(초점을 옮긴다) */
  onClose: (id: number) => void;
}

/** 자동 닫힘 타이머는 포인터가 올라가 있거나 초점이 안에 있는 동안 멈춘다(WCAG 2.2.1). */
function ToastItem({ toast, onDismiss, onClose }: ToastItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(DURATION_MS);

  // li는 상호작용 요소가 아니므로 일시정지용 이벤트는 DOM 리스너로 듣는다.
  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;
    const listeners: [keyof HTMLElementEventMap, () => void][] = [
      [
        'mouseenter',
        () => {
          setHovered(true);
        },
      ],
      [
        'mouseleave',
        () => {
          setHovered(false);
        },
      ],
      [
        'focusin',
        () => {
          setFocused(true);
        },
      ],
      [
        'focusout',
        () => {
          setFocused(false);
        },
      ],
    ];
    for (const [type, listener] of listeners) item.addEventListener(type, listener);
    return () => {
      for (const [type, listener] of listeners) item.removeEventListener(type, listener);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, toast.id, onDismiss]);

  const { icon: Icon, label } = TONE[toast.tone];

  return (
    <li ref={itemRef} data-toast-id={toast.id} className={cn(styles.toast, styles[toast.tone])}>
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>
        {/* 아이콘 색이 전달하는 종류를 낭독기에도 전달한다. */}
        <VisuallyHidden>{label}: </VisuallyHidden>
        {toast.message}
      </p>
      <button
        type="button"
        className={styles.close}
        onClick={() => {
          onClose(toast.id);
        }}
      >
        <X size={16} aria-hidden="true" />
        <VisuallyHidden>알림 닫기</VisuallyHidden>
      </button>
    </li>
  );
}

export interface ToastRegionProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

/**
 * 알림 표시 영역. live region은 처음부터 항상 렌더링해 두고 내용만 바꾼다.
 * (내용과 함께 새로 생긴 live region은 화면 낭독기가 읽지 않는 경우가 있다.)
 *
 * 초점 규칙
 * - 알림이 나타나거나 자동으로 닫힐 때는 초점을 옮기지 않는다.
 * - 사용자가 닫기 버튼으로 닫으면, 남은 알림의 닫기 버튼(다음 → 이전 순)으로 옮긴다.
 *   남은 알림이 없으면 알림 영역에 들어오기 직전에 초점이 있던 요소로, 그 요소가 없으면 페이지 제목(h1)으로 옮긴다.
 */
export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const focusBeforeRegion = useRef<HTMLElement | null>(null);

  // 알림 영역 밖에서 안으로 초점이 들어올 때, 직전 요소를 기억해 둔다.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const handleFocusIn = (event: FocusEvent) => {
      const previous = event.relatedTarget;
      if (previous instanceof HTMLElement && !region.contains(previous)) {
        focusBeforeRegion.current = previous;
      }
    };
    region.addEventListener('focusin', handleFocusIn);
    return () => {
      region.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  const closeByUser = (id: number) => {
    const index = toasts.findIndex((toast) => toast.id === id);
    const next = toasts[index + 1] ?? toasts[index - 1];
    const nextButton = next
      ? regionRef.current?.querySelector<HTMLButtonElement>(`[data-toast-id="${next.id}"] button`)
      : null;
    const previous = focusBeforeRegion.current;
    const fallback =
      nextButton ??
      (previous?.isConnected ? previous : null) ??
      document.querySelector<HTMLElement>('main h1[tabindex="-1"]');

    // 닫히는 알림이 사라지기 전에 초점을 옮겨, 초점이 본문(body)으로 빠지지 않게 한다.
    fallback?.focus();
    onDismiss(id);
  };

  return (
    <div ref={regionRef} role="status" className={styles.region}>
      <ul className={styles.list}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} onClose={closeByUser} />
        ))}
      </ul>
    </div>
  );
}
