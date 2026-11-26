import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Dropdown.module.scss';

export interface DropdownProps {
  /** 트리거 버튼의 내용. 보이는 텍스트가 없으면 VisuallyHidden으로 이름을 넣는다. */
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  /** 패널을 트리거의 어느 쪽 끝에 맞출지 */
  align?: 'start' | 'end';
  /** 패널 내용. close를 호출하면 패널을 닫는다(초점은 옮기지 않는다). */
  children: (close: () => void) => ReactNode;
}

/**
 * 디스클로저 패턴의 드롭다운(button[aria-expanded] + 패널).
 * 링크·명령 몇 개짜리 메뉴이므로 ARIA menu(화살표 키 탐색)를 쓰지 않는다(설계서 1장 제안 5).
 *
 * - ESC: 닫고 트리거로 초점 복귀
 * - 바깥 클릭: 닫음(초점은 사용자가 클릭한 곳에 둔다)
 * - Tab으로 패널 밖으로 나가면 닫음
 *
 * Phase 2-3에서는 헤더에 필요한 최소 기능만 구현했다. 상태별 스타일과 가이드 예시는 Phase 2-4에서 보완한다.
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

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
        triggerRef.current?.focus();
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
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
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
        id={panelId}
        hidden={!open}
        className={cn(
          styles.panel,
          align === 'end' ? styles.alignEnd : styles.alignStart,
          panelClassName,
        )}
      >
        {children(() => {
          setOpen(false);
        })}
      </div>
    </div>
  );
}
