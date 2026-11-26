import { X } from 'lucide-react';
import { useId, type RefObject } from 'react';

import { Button } from '@/components/ui/Button';
import { useModalDialog } from '@/hooks/useModalDialog';

import styles from './MobileNav.module.scss';
import { SidebarNav } from './SidebarNav';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** 닫힌 뒤 초점을 돌려줄 요소(헤더의 메뉴 버튼) */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/**
 * 1023px 이하에서 사이드바 대신 쓰는 메뉴 서랍. Modal과 같은 useModalDialog(네이티브 dialog)를 쓴다.
 *
 * 초점 규칙(설계서 8-1)
 * - ESC, 닫기 버튼, 배경 클릭: 메뉴 버튼으로 복귀
 * - 메뉴 링크로 다른 페이지 이동: 서랍을 먼저 닫고, 라우트 전환 규칙(h1 초점)을 따른다.
 *   열린 모달 밖의 h1은 inert 상태라 초점을 받을 수 없으므로, 링크 클릭 시점에 즉시 닫는다.
 */
export function MobileNav({ open, onClose, returnFocusRef }: MobileNavProps) {
  const titleId = useId();
  const dialogRef = useModalDialog({
    open,
    onClose,
    // 메뉴 서랍은 입력 내용이 없으므로 배경을 눌러 닫을 수 있게 한다.
    closeOnBackdrop: true,
    fallbackFocus: () => returnFocusRef.current,
  });

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
          <Button variant="ghost" iconOnly icon={X} onClick={closeDialog}>
            메뉴 닫기
          </Button>
        </div>
        <SidebarNav onNavigate={closeDialog} />
      </div>
    </dialog>
  );
}
