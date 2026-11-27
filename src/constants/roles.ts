import type { UserRole } from '@/types/user';

/** 헤더 사용자 메뉴의 역할 표시 */
export const ROLE_LABEL: Record<UserRole, string> = {
  admin: '관리자',
  operator: '운영자',
  viewer: '조회자',
  billing: '비용 관리자',
};
