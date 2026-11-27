export type UserRole = 'admin' | 'operator' | 'viewer' | 'billing';

export type UserStatus = 'active' | 'inactive' | 'invited';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  /** 초대 후 아직 로그인하지 않은 사용자는 null. ISO 8601 */
  lastLoginAt: string | null;
  /** ISO 8601 */
  createdAt: string;
}
