import { useRef, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

import { Modal } from './Modal';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** 확인할 내용. 삭제는 대상 이름을 포함한다. */
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * 확인형 모달(삭제 확인 등). 되돌릴 수 없는 작업을 실수로 실행하지 않도록 초기 초점은 "취소"에 둔다.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel = '취소',
  tone = 'danger',
  loading = false,
  fallbackFocus,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      // 입력 내용이 없고 배경 클릭은 "취소"와 같으므로 명시적으로 허용한다.
      closeOnBackdrop
      initialFocus={() => cancelRef.current}
      fallbackFocus={fallbackFocus}
      footer={
        <>
          <Button ref={cancelRef} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
