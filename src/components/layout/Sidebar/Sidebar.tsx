import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { cn } from '@/utils/cn';

import styles from './Sidebar.module.scss';
import { SidebarNav } from './SidebarNav';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * 데스크톱 사이드바(≥1024px). 펼침 240px / 접힘 56px.
 * 접힌 상태에서는 아이콘에 툴팁을 보여준다. 툴팁은 포인터를 올려도 유지되고 ESC로 숨길 수 있다(WCAG 1.4.13).
 */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navId = useId();
  const [tooltipsDismissed, setTooltipsDismissed] = useState(false);

  useEffect(() => {
    if (!collapsed) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTooltipsDismissed(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [collapsed]);

  const allowTooltips = () => {
    setTooltipsDismissed(false);
  };

  const toggleLabel = collapsed ? '사이드바 펼치기' : '사이드바 접기';

  return (
    <div
      className={cn(
        styles.sidebar,
        collapsed && styles.collapsed,
        tooltipsDismissed && styles.tooltipsDismissed,
      )}
    >
      <SidebarNav id={navId} collapsed={collapsed} onItemEnter={allowTooltips} />

      <div className={styles.footer}>
        <div className={styles.tipAnchor}>
          {/* 이름은 동작(접기/펼치기), aria-expanded는 현재 상태를 전달한다. */}
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={!collapsed}
            aria-controls={navId}
            onClick={onToggle}
            onMouseEnter={allowTooltips}
            onFocus={allowTooltips}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} className={styles.icon} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} className={styles.icon} aria-hidden="true" />
            )}
            <span className={styles.label}>{toggleLabel}</span>
          </button>
          {collapsed && (
            <span className={styles.tooltip} aria-hidden="true">
              <span className={styles.tooltipBox}>{toggleLabel}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
