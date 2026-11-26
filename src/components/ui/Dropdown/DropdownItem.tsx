import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from '@/utils/cn';

import styles from './Dropdown.module.scss';

/** Dropdown 패널 안의 항목 목록 */
export function DropdownList({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}

interface ItemContentProps {
  icon?: LucideIcon;
  children: ReactNode;
}

function ItemContent({ icon: Icon, children }: ItemContentProps) {
  return (
    <>
      {Icon && <Icon size={16} className={styles.itemIcon} aria-hidden="true" />}
      <span className={styles.itemLabel}>{children}</span>
    </>
  );
}

export interface DropdownItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon?: LucideIcon;
  /** 삭제처럼 되돌리기 어려운 동작 */
  tone?: 'default' | 'danger';
  children: ReactNode;
}

/** 동작을 실행하는 항목(button) */
export function DropdownItem({
  icon,
  tone = 'default',
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <li>
      <button
        type="button"
        {...props}
        className={cn(styles.item, tone === 'danger' && styles.danger, className)}
      >
        <ItemContent icon={icon}>{children}</ItemContent>
      </button>
    </li>
  );
}

export interface DropdownLinkItemProps extends Omit<LinkProps, 'children'> {
  icon?: LucideIcon;
  children: ReactNode;
}

/** 다른 페이지로 이동하는 항목(a) */
export function DropdownLinkItem({ icon, className, children, ...props }: DropdownLinkItemProps) {
  return (
    <li>
      <Link {...props} className={cn(styles.item, className)}>
        <ItemContent icon={icon}>{children}</ItemContent>
      </Link>
    </li>
  );
}
