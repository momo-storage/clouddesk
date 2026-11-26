import { useEffect, useEffectEvent, useRef } from 'react';

interface UseModalDialogOptions {
  open: boolean;
  /**
   * 사용자가 모달을 닫았을 때(ESC, 배경 클릭, 닫기 버튼 등 dialog가 스스로 닫힌 경우) 한 번 호출된다.
   * 사용처가 open을 false로 바꿔 닫은 경우에는 이미 닫기를 처리했으므로 다시 호출하지 않는다.
   */
  onClose: () => void;
  /**
   * 배경막 클릭으로 닫을지. 기본값은 false다.
   * 이 프로젝트의 모달은 대부분 입력 폼이라, 실수로 닫혀 입력 내용을 잃지 않도록 필요한 곳에서만 명시적으로 켠다.
   */
  closeOnBackdrop?: boolean;
  /** 열릴 때 초점을 줄 요소. 없으면 브라우저가 dialog 안의 첫 초점 가능 요소를 고른다. */
  initialFocus?: () => HTMLElement | null;
  /**
   * 닫힌 뒤 초점이 갈 곳이 없을 때(실행 요소가 삭제됐거나 초점이 본문으로 빠졌을 때) 대신 초점을 받을 요소.
   * 실행 요소가 남아 있으면 브라우저가 그 요소로 초점을 되돌리므로 호출하지 않는다.
   */
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * 네이티브 <dialog>의 showModal() 기반 모달 공통 동작(Modal, 메뉴 서랍).
 * ESC 닫기·배경 inert·초점 가두기는 브라우저가 처리하고, 이 훅은 열고 닫기와 초점 복귀만 맡는다(설계서 8-1).
 */
export function useModalDialog({
  open,
  onClose,
  closeOnBackdrop = false,
  initialFocus,
  fallbackFocus,
}: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<Element | null>(null);

  const focusInitial = useEffectEvent(() => {
    initialFocus?.()?.focus();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
      focusInitial();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useEffectEvent(() => {
    // close 이벤트는 비동기로 발생하므로, 사용처가 이미 open=false로 바꿔 닫았다면 여기서는 open이 false다.
    // 이 경우 onClose를 다시 부르지 않아 중복 실행(알림 두 번 등)을 막는다. 초점 복귀는 어느 경우든 처리한다.
    if (open) onClose();

    const dialog = dialogRef.current;
    const active = document.activeElement;
    const focusLost = !active || active === document.body || (dialog?.contains(active) ?? false);
    if (!focusLost) return;

    // 1) 실행 요소가 아직 있고 사용 가능하면 그 요소로(Safari처럼 클릭으로 초점을 주지 않는 경우 포함)
    const opener = openerRef.current;
    if (opener instanceof HTMLElement && opener.isConnected && !opener.matches(':disabled')) {
      opener.focus();
      return;
    }
    // 2) 실행 요소가 사라졌으면 사용처가 정한 논리적인 위치로
    fallbackFocus?.()?.focus();
  });

  const handleBackdropClick = useEffectEvent((event: MouseEvent) => {
    // 배경막을 누르면 이벤트 대상이 dialog 자신이다(내용 영역은 dialog를 꽉 채우는 자식 요소).
    const dialog = dialogRef.current;
    if (closeOnBackdrop && dialog && event.target === dialog) {
      dialog.close();
    }
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCloseEvent = () => {
      handleClose();
    };
    const onClick = (event: MouseEvent) => {
      handleBackdropClick(event);
    };
    dialog.addEventListener('close', onCloseEvent);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', onCloseEvent);
      dialog.removeEventListener('click', onClick);
    };
  }, []);

  return dialogRef;
}
