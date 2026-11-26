import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/utils/cn';

import styles from './Modal.module.scss';

export interface ModalProps {
  open: boolean;
  /**
   * 사용자가 ESC·닫기 버튼·배경 클릭으로 닫았을 때 한 번 호출된다.
   * 하단 "취소" 버튼에도 같은 함수를 연결하면 된다(사용처가 open을 false로 바꾼 뒤에는 다시 호출되지 않는다).
   */
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** 하단 액션 버튼 영역 */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /**
   * 배경 클릭으로 닫기. 기본값 false(입력 폼 보호). 입력 내용이 없는 모달에서만 명시적으로 켠다.
   * 폼 제출은 footer의 버튼에 form 속성(form="폼 id")을 주어 children의 form과 연결한다.
   */
  closeOnBackdrop?: boolean;
  /** 열릴 때 초점을 줄 요소(폼은 첫 입력 필드, 삭제 확인은 "취소") */
  initialFocus?: () => HTMLElement | null;
  /** 실행 요소가 사라졌을 때 초점을 받을 요소(예: 삭제한 행의 다음 행) */
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * 네이티브 dialog 기반 모달.
 * - 브라우저 제공: ESC 닫기, 배경 inert, 초점 가두기, top layer 표시
 * - 직접 처리: 초기 초점, 닫힌 뒤 초점 복귀(useModalDialog)
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = false,
  initialFocus,
  fallbackFocus,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useModalDialog({
    open,
    onClose,
    closeOnBackdrop,
    initialFocus,
    fallbackFocus,
  });

  return (
    <dialog
      ref={dialogRef}
      className={cn(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            icon={X}
            className={styles.closeButton}
            onClick={() => dialogRef.current?.close()}
          >
            닫기
          </Button>
        </div>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
