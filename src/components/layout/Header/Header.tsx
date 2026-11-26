import { Cloud, Menu } from 'lucide-react';
import type { Ref } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { HOME_PATH } from '@/constants/navigation';

import styles from './Header.module.scss';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';

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
        <Badge className={styles.demoBadge}>데모</Badge>
      </div>

      <div className={styles.actions}>
        <NotificationMenu triggerClassName={styles.iconButton} />
        <span className={styles.divider} aria-hidden="true" />
        <UserMenu triggerClassName={styles.userButton} />
      </div>
    </header>
  );
}
