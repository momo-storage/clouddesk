import { X } from 'lucide-react';
import { useEffect, useId, useRef, type RefObject } from 'react';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden';

import styles from './MobileNav.module.scss';
import { SidebarNav } from './SidebarNav';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** 닫힌 뒤 초점을 돌려줄 요소(헤더의 메뉴 버튼) */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/**
 * 1023px 이하에서 사이드바 대신 쓰는 메뉴 서랍.
 * 네이티브 <dialog>의 showModal()을 써서 ESC 닫기, 배경 inert 처리, 초점 가두기를 브라우저에 맡긴다.
 *
 * 초점 규칙(설계서 8-1)
 * - ESC, 닫기 버튼, 배경 클릭: 메뉴 버튼으로 복귀
 * - 메뉴 링크로 다른 페이지 이동: 서랍을 먼저 닫고, 라우트 전환 규칙(h1 초점)을 따른다.
 *   열린 모달 밖의 h1은 inert 상태라 초점을 받을 수 없으므로, 링크 클릭 시점에 즉시 닫는다.
 */
export function MobileNav({ open, onClose, returnFocusRef }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // 배경막(::backdrop)을 누르면 이벤트 대상이 dialog 자신이다. 패널은 dialog를 꽉 채운다.
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    const handleClose = () => {
      onClose();
      // 브라우저가 초점을 메뉴 버튼으로 복원하지 못한 경우에만 직접 옮긴다.
      // Safari(WebKit)는 버튼을 클릭해도 초점을 주지 않아, 서랍을 연 시점의 초점이 본문(body)이다.
      // 페이지 이동으로 h1이 이미 초점을 받았다면 그대로 둔다.
      const active = document.activeElement;
      if (!active || active === document.body || dialog.contains(active)) {
        returnFocusRef.current?.focus();
      }
    };

    dialog.addEventListener('click', handleClick);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('click', handleClick);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose, returnFocusRef]);

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span id={titleId} className={styles.title}>
            메뉴
          </span>
          <button type="button" className={styles.closeButton} onClick={closeDialog}>
            <X size={18} aria-hidden="true" />
            <VisuallyHidden>메뉴 닫기</VisuallyHidden>
          </button>
        </div>
        <SidebarNav onNavigate={closeDialog} />
      </div>
    </dialog>
  );
}
