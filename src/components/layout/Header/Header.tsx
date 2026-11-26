import { Bell, ChevronDown, Cloud, Component, Menu } from 'lucide-react';
import type { Ref } from 'react';
import { Link } from 'react-router';

import { Dropdown } from '@/components/ui/Dropdown';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { HOME_PATH } from '@/constants/navigation';
import { CURRENT_USER } from '@/mocks/currentUser';

import styles from './Header.module.scss';

export interface HeaderProps {
  /** 사이드바가 서랍으로 바뀌는 폭(≤1023px)에서 메뉴 버튼을 표시한다. */
  showMenuButton: boolean;
  menuOpen: boolean;
  onMenuClick: () => void;
  /** 서랍이 닫힐 때 초점을 돌려받는 메뉴 버튼 */
  menuButtonRef: Ref<HTMLButtonElement>;
}

export function Header({ showMenuButton, menuOpen, onMenuClick, menuButtonRef }: HeaderProps) {
  return (
    <header className={styles.header}>
      {showMenuButton && (
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={onMenuClick}
        >
          <Menu size={20} aria-hidden="true" />
          <VisuallyHidden>주 메뉴</VisuallyHidden>
        </button>
      )}

      <div className={styles.brand}>
        <Link to={HOME_PATH} className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <Cloud size={16} strokeWidth={2.25} />
          </span>
          CloudDesk
        </Link>
        <span className={styles.demoBadge}>데모</span>
      </div>

      <div className={styles.actions}>
        <Dropdown
          align="end"
          triggerClassName={styles.iconButton}
          trigger={
            <>
              <Bell size={18} aria-hidden="true" />
              <VisuallyHidden>알림</VisuallyHidden>
            </>
          }
        >
          {() => (
            <div className={styles.notificationPanel}>
              <p className={styles.panelTitle}>알림</p>
              <p className={styles.panelEmpty}>새 알림이 없습니다.</p>
            </div>
          )}
        </Dropdown>

        <span className={styles.divider} aria-hidden="true" />

        <Dropdown
          align="end"
          triggerClassName={styles.userButton}
          trigger={
            <>
              <span className={styles.avatar} aria-hidden="true">
                {CURRENT_USER.name.charAt(0)}
              </span>
              <span className={styles.userName}>{CURRENT_USER.name}</span>
              <VisuallyHidden>계정 메뉴</VisuallyHidden>
              <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
            </>
          }
        >
          {(close) => (
            <>
              <div className={styles.profile}>
                <p className={styles.profileName}>{CURRENT_USER.name}</p>
                <p className={styles.profileMeta}>{CURRENT_USER.email}</p>
                <p className={styles.profileMeta}>역할: {CURRENT_USER.role}</p>
              </div>
              <ul className={styles.menuList}>
                <li>
                  <Link to="/guide" className={styles.menuLink} onClick={close}>
                    <Component size={16} aria-hidden="true" />
                    UI 컴포넌트 가이드
                  </Link>
                </li>
              </ul>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
