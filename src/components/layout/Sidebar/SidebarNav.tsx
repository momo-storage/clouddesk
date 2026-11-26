import { useId } from 'react';
import { Link, useLocation } from 'react-router';

import { Tooltip } from '@/components/ui/Tooltip';
import { VISIBLE_NAVIGATION } from '@/constants/navigation';
import { cn } from '@/utils/cn';

import styles from './Sidebar.module.scss';

export interface SidebarNavProps {
  id?: string;
  /** 접힌 사이드바: 아이콘만 보이고 메뉴 이름은 툴팁과 숨김 텍스트로 제공한다. */
  collapsed?: boolean;
  /** 메뉴 링크를 눌렀을 때(서랍을 닫는 데 쓴다) */
  onNavigate?: () => void;
}

/**
 * 현재 위치 표시
 * - 메뉴 경로와 정확히 같으면 aria-current="page"
 * - 메뉴의 하위 경로(예: 리소스 상세)면 aria-current="true": 현재 섹션이지만 현재 페이지는 아님을 구분한다.
 */
function getCurrentState(pathname: string, path: string): 'page' | 'true' | undefined {
  if (pathname === path) return 'page';
  if (pathname.startsWith(`${path}/`)) return 'true';
  return undefined;
}

/** 데스크톱 사이드바와 모바일 서랍이 함께 쓰는 주 메뉴 */
export function SidebarNav({ id, collapsed = false, onNavigate }: SidebarNavProps) {
  const { pathname } = useLocation();
  const baseId = useId();

  return (
    <nav id={id} aria-label="주 메뉴" className={styles.nav}>
      {VISIBLE_NAVIGATION.map((group) => {
        const labelId = `${baseId}-${group.id}`;
        return (
          <div key={group.id} className={styles.group}>
            <span id={labelId} className={styles.groupLabel}>
              {group.label}
            </span>
            <ul aria-labelledby={labelId} className={styles.list}>
              {group.items.map((item) => {
                const current = getCurrentState(pathname, item.path);
                const Icon = item.icon;
                const link = (
                  <Link
                    to={item.path}
                    aria-current={current}
                    className={cn(styles.link, current && styles.active)}
                    onClick={onNavigate}
                  >
                    <Icon size={18} className={styles.icon} aria-hidden="true" />
                    <span className={styles.label}>{item.label}</span>
                  </Link>
                );
                return (
                  <li key={item.path}>
                    {/* 링크 이름과 같은 내용을 보여주기만 하므로 label 종류(낭독기에서 숨김)로 쓴다.
                        펼친 상태에서는 이름이 보이므로 끈다. */}
                    <Tooltip
                      content={item.label}
                      placement="right"
                      kind="label"
                      disabled={!collapsed}
                      className={styles.tooltipAnchor}
                    >
                      {link}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
