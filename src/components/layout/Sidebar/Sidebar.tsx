import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useId } from 'react';

import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

import styles from './Sidebar.module.scss';
import { SidebarNav } from './SidebarNav';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * 데스크톱 사이드바(≥1024px). 펼침 240px / 접힘 56px.
 * 접힌 상태에서는 아이콘에 공통 Tooltip을 붙인다(포인터를 올려도 유지, ESC로 숨김: WCAG 1.4.13).
 */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navId = useId();
  const toggleLabel = collapsed ? '사이드바 펼치기' : '사이드바 접기';

  // 이름은 동작(접기/펼치기), aria-expanded는 현재 상태를 전달한다.
  const toggle = (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={!collapsed}
      aria-controls={navId}
      onClick={onToggle}
    >
      {collapsed ? (
        <PanelLeftOpen size={18} className={styles.icon} aria-hidden="true" />
      ) : (
        <PanelLeftClose size={18} className={styles.icon} aria-hidden="true" />
      )}
      <span className={styles.label}>{toggleLabel}</span>
    </button>
  );

  return (
    <div className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      <SidebarNav id={navId} collapsed={collapsed} />
      <div className={styles.footer}>
        <Tooltip
          content={toggleLabel}
          placement="right"
          kind="label"
          disabled={!collapsed}
          className={styles.tooltipAnchor}
        >
          {toggle}
        </Tooltip>
      </div>
    </div>
  );
}
