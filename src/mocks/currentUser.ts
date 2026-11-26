/**
 * 헤더 사용자 메뉴에 표시할 데모 사용자.
 * 인증이 없는 데모이므로 고정 값이다. Phase 2-5에서 사용자 Mock 데이터와 함께 정리한다.
 */
export const CURRENT_USER = {
  name: '김데모',
  email: 'admin@clouddesk.example',
  role: '관리자',
} as const;
