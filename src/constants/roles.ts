import type { Permission, UserRole, UserStatus } from '@/types/user';

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: '관리자',
  operator: '운영자',
  viewer: '조회자',
  billing: '비용 관리자',
};

export const PERMISSION_LABEL: Record<Permission, string> = {
  'resource:read': '리소스 조회',
  'resource:write': '리소스 등록·수정',
  'resource:delete': '리소스 삭제',
  'monitoring:read': '모니터링 조회',
  'cost:read': '비용 조회',
  'user:manage': '사용자 관리',
};

/** 역할별 권한. 데모에서는 권한에 따른 화면 분기 없이 표시에만 쓴다(설계서 3-4). */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'resource:read',
    'resource:write',
    'resource:delete',
    'monitoring:read',
    'cost:read',
    'user:manage',
  ],
  operator: ['resource:read', 'resource:write', 'resource:delete', 'monitoring:read'],
  viewer: ['resource:read', 'monitoring:read'],
  billing: ['resource:read', 'cost:read'],
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  invited: '초대됨',
};
