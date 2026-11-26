import type { CloudProvider } from './resource';

export type EventSeverity = 'info' | 'warning' | 'critical';

/** 리소스 이벤트·알림. 헤더 알림, 대시보드 최근 이벤트, 리소스 상세 이벤트 로그가 같은 데이터를 쓴다. */
export interface CloudEvent {
  id: string;
  /** 리소스가 삭제돼도 이벤트는 남는다. 이름·제공업체는 발생 시점 값을 함께 저장한다. */
  resourceId: string;
  resourceName: string;
  provider: CloudProvider;
  severity: EventSeverity;
  message: string;
  /** ISO 8601 */
  occurredAt: string;
  read: boolean;
}
