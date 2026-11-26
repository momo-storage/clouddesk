import type { EventSeverity } from '@/types/event';
import type { ResourceStatus } from '@/types/resource';

export const RESOURCE_STATUS_LABEL: Record<ResourceStatus, string> = {
  running: '실행 중',
  stopped: '중지됨',
  pending: '전환 중',
  error: '오류',
};

export const RESOURCE_STATUS_KEYS: ResourceStatus[] = ['running', 'stopped', 'pending', 'error'];

export const EVENT_SEVERITY_LABEL: Record<EventSeverity, string> = {
  info: '정보',
  warning: '경고',
  critical: '위험',
};
