import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import { USAGE_THRESHOLD } from '@/constants/thresholds';
import type { CloudEvent, EventSeverity } from '@/types/event';
import type { Resource } from '@/types/resource';

import { getTier } from './network';
import { createRandom } from './random';

/**
 * 시드 이벤트. 리소스의 현재 상태·사용률에서 만들어 데이터 간 일관성을 지킨다.
 * - 오류 상태 → 상태 검사 실패(위험)
 * - CPU 90% 이상 → 위험, 70% 이상 → 경고
 * - 디스크 85% 이상 → 경고
 * - 그 밖에 시작·중지·백업·보안 규칙 변경(정보·경고)
 * 기준 시각 이전 7일 안에서 발생하며, 최근 5건만 읽지 않음 상태다.
 */
const UNREAD_COUNT = 5;
const WINDOW_HOURS = 7 * 24;

export function createSeedEvents(resources: Resource[]): CloudEvent[] {
  const random = createRandom(1126);
  const reference = new Date(DEMO_REFERENCE_TIME).getTime();
  const drafts: Omit<CloudEvent, 'id' | 'read'>[] = [];

  const add = (
    resource: Resource,
    severity: EventSeverity,
    message: string,
    maxHoursAgo = WINDOW_HOURS,
  ) => {
    const minutesAgo = random.int(5, maxHoursAgo * 60);
    drafts.push({
      resourceId: resource.id,
      resourceName: resource.name,
      provider: resource.provider,
      severity,
      message,
      occurredAt: new Date(reference - minutesAgo * 60_000).toISOString(),
    });
  };

  for (const resource of resources) {
    if (resource.status === 'error') {
      add(resource, 'critical', '인스턴스 상태 검사에 실패했습니다. 시스템 로그를 확인하세요.', 12);
    }
    if (resource.cpuUsage >= USAGE_THRESHOLD.critical) {
      add(
        resource,
        'critical',
        `CPU 사용률이 위험 임계치(${String(USAGE_THRESHOLD.critical)}%)를 넘었습니다. 현재 ${String(Math.round(resource.cpuUsage))}%`,
        6,
      );
    } else if (resource.cpuUsage >= USAGE_THRESHOLD.warning && random.chance(0.6)) {
      add(
        resource,
        'warning',
        `CPU 사용률이 경고 임계치(${String(USAGE_THRESHOLD.warning)}%)를 넘었습니다. 현재 ${String(Math.round(resource.cpuUsage))}%`,
        24,
      );
    }
    if (resource.diskUsage >= 85) {
      add(
        resource,
        'warning',
        `디스크 사용률이 85%를 넘었습니다. 현재 ${String(Math.round(resource.diskUsage))}%`,
        48,
      );
    }
    if (resource.status === 'stopped' && random.chance(0.35)) {
      add(resource, 'info', '인스턴스가 중지되었습니다.');
    }
    if (resource.status === 'pending') {
      add(resource, 'info', '인스턴스를 시작하는 중입니다.', 1);
    }
    if (resource.status === 'running' && random.chance(0.12)) {
      add(resource, 'info', '인스턴스가 시작되었습니다.');
    }
    const tier = getTier(resource.name);
    if (tier === 'data' && random.chance(0.5)) {
      add(resource, 'info', '예약된 스냅샷 백업이 완료되었습니다.');
    }
    if (tier === 'web' && random.chance(0.2)) {
      add(resource, 'warning', '인바운드 보안 규칙이 변경되었습니다.');
    }
  }

  return drafts
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((draft, index) => ({
      ...draft,
      id: `evt-${String(index + 1).padStart(4, '0')}`,
      read: index >= UNREAD_COUNT,
    }));
}
