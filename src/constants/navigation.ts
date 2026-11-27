import {
  Activity,
  Component,
  LayoutDashboard,
  Server,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /**
   * false면 사이드바에 표시하지 않는다.
   * 2차 개발 화면은 구현 전까지 메뉴와 라우트를 모두 두지 않는다("준비 중" 화면을 만들지 않음).
   */
  enabled: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    id: 'operations',
    label: '운영',
    items: [
      { label: '대시보드', path: '/dashboard', icon: LayoutDashboard, enabled: true },
      { label: '리소스 관리', path: '/resources', icon: Server, enabled: true },
      { label: '모니터링', path: '/monitoring', icon: Activity, enabled: true },
      { label: '비용 관리', path: '/costs', icon: Wallet, enabled: false },
    ],
  },
  {
    id: 'administration',
    label: '관리',
    items: [{ label: '사용자 관리', path: '/users', icon: Users, enabled: false }],
  },
  {
    id: 'design-system',
    label: '디자인 시스템',
    items: [{ label: 'UI 컴포넌트 가이드', path: '/guide', icon: Component, enabled: true }],
  },
];

/** 사이드바에 실제로 표시할 메뉴. 항목이 모두 비활성인 그룹은 뺀다. */
export const VISIBLE_NAVIGATION: NavGroup[] = NAVIGATION.map((group) => ({
  ...group,
  items: group.items.filter((item) => item.enabled),
})).filter((group) => group.items.length > 0);

export const HOME_PATH = '/dashboard';
