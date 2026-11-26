import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { keepInViewportX } from '@/utils/keepInViewport';

import styles from './Dropdown.module.scss';

export interface DropdownProps {
  /** 트리거 버튼의 내용. 보이는 텍스트가 없으면 VisuallyHidden으로 이름을 넣는다. */
  trigger: ReactNode;
  /** 트리거 모양. 일반 화면에서는 getButtonClassName()을 쓴다. */
  triggerClassName?: string;
  panelClassName?: string;
  /** 패널을 트리거의 어느 쪽 끝에 맞출지 */
  align?: 'start' | 'end';
  /**
   * 패널 내용. 항목을 실행할 때 close()를 호출한다.
   * close()는 초점을 트리거로 돌려준다. 항목이 모달을 열면 모달이 닫힌 뒤 초점이 트리거로 돌아온다.
   */
  children: (close: () => void) => ReactNode;
}

/**
 * 디스클로저 패턴의 드롭다운(button[aria-expanded] + 패널).
 * 링크·명령 몇 개짜리 메뉴이므로 ARIA menu(화살표 키 탐색)를 쓰지 않는다(설계서 1장 제안 5).
 * 항목 사이는 Tab으로 이동한다.
 *
 * - ESC: 닫고 트리거로 초점 복귀
 * - 바깥 클릭: 닫음(초점은 사용자가 클릭한 곳에 둔다)
 * - Tab으로 패널 밖으로 나가면 닫음
 */
export function Dropdown({
  trigger,
  triggerClassName,
  panelClassName,
  align = 'start',
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;
  // 렌더링 중 호출되는 children(close)에 넘기므로 ref 대신 id로 트리거를 찾는다.
  const focusTrigger = () => document.getElementById(triggerId)?.focus();

  useEffect(() => {
    if (!open) return;

    // 바깥 클릭, 그리고 Tab 등으로 초점이 바깥 요소로 옮겨간 경우 닫는다.
    const closeIfOutside = (event: Event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.getElementById(triggerId)?.focus();
      }
    };

    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('focusin', closeIfOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('focusin', closeIfOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, triggerId]);

  // 좁은 화면에서 트리거가 가장자리에 있지 않으면 패널이 화면 밖으로 나갈 수 있어 가로 위치를 보정한다.
  useLayoutEffect(() => {
    if (open && panelRef.current) keepInViewportX(panelRef.current);
  }, [open]);

  const close = () => {
    setOpen(false);
    focusTrigger();
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        id={triggerId}
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        {trigger}
      </button>
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className={cn(
          styles.panel,
          align === 'end' ? styles.alignEnd : styles.alignStart,
          panelClassName,
        )}
      >
        {children(close)}
      </div>
    </div>
  );
}
