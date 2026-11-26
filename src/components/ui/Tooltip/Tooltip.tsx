import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';

import { cn } from '@/utils/cn';
import { keepInViewportX } from '@/utils/keepInViewport';

import styles from './Tooltip.module.scss';

interface TriggerProps {
  'aria-describedby'?: string;
}

export interface TooltipProps {
  content: string;
  /** 초점을 받을 수 있는 요소(버튼, 링크) 하나 */
  children: ReactElement<TriggerProps>;
  placement?: 'top' | 'right' | 'bottom';
  /**
   * - description: 추가 설명. role="tooltip" + aria-describedby로 연결한다.
   * - label: 아이콘 단독 요소의 이름을 눈으로 보여주는 용도. 이름은 이미 요소에 있으므로 툴팁은 낭독기에서 숨긴다.
   */
  kind?: 'description' | 'label';
  /**
   * 툴팁을 잠시 끈다(예: 펼친 사이드바에서는 이름이 보이므로 불필요).
   * 조건부로 Tooltip을 감싸면 트리거가 다시 마운트되어 초점을 잃으므로, 구조는 유지하고 이 값으로 끈다.
   */
  disabled?: boolean;
  className?: string;
}

/**
 * 호버와 키보드 초점 모두에서 나타나는 툴팁(WCAG 1.4.13)
 * - 포인터를 툴팁 위로 옮겨도 사라지지 않는다(트리거와 툴팁 사이 투명 연결 영역).
 * - ESC로 숨길 수 있고, 포인터·초점이 다시 들어오면 다시 나타난다.
 *
 * 감싸는 span은 상호작용 요소가 아니므로 이벤트는 DOM 리스너로 듣는다(실제 조작은 안쪽 트리거가 받는다).
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  kind = 'description',
  disabled = false,
  className,
}: TooltipProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const visible = (hovered || focused) && !dismissed;

  // 화면 가장자리에 가까운 트리거에서 툴팁이 화면 밖으로 나가지 않도록, 보일 때 가로 위치만 안쪽으로 밀어 넣는다.
  // 위치 계산 라이브러리 없이 처리하며, 스크롤 영역에 의한 잘림은 사용 위치에서 피한다(설계서 6-4).
  useLayoutEffect(() => {
    if (visible && boxRef.current) keepInViewportX(boxRef.current);
  }, [visible, content]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const listeners: [keyof HTMLElementEventMap, () => void][] = [
      [
        'mouseenter',
        () => {
          setHovered(true);
          setDismissed(false);
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
          setDismissed(false);
        },
      ],
      [
        'focusout',
        () => {
          setFocused(false);
        },
      ],
    ];
    for (const [type, listener] of listeners) anchor.addEventListener(type, listener);
    return () => {
      for (const [type, listener] of listeners) anchor.removeEventListener(type, listener);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  const trigger =
    kind === 'description' && !disabled
      ? cloneElement(children, {
          'aria-describedby': cn(children.props['aria-describedby'], id),
        })
      : children;

  return (
    <span ref={anchorRef} className={cn(styles.anchor, className)}>
      {trigger}
      {!disabled && (
        <span
          id={id}
          role={kind === 'description' ? 'tooltip' : undefined}
          aria-hidden={kind === 'label' ? true : undefined}
          className={cn(styles.tooltip, styles[placement], visible && styles.visible)}
        >
          <span ref={boxRef} className={styles.box}>
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
