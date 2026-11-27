import { StatusBadge } from '@/components/data/StatusBadge';
import { UsageBar } from '@/components/data/UsageBar';
import { Panel } from '@/components/layout/Panel';
import { Badge } from '@/components/ui/Badge';
import { findInstanceType, PROVIDERS } from '@/constants/providers';
import type { CloudEvent } from '@/types/event';
import type { Resource } from '@/types/resource';
import { formatDateTime, formatNumber } from '@/utils/format';

import styles from '../ResourceDetailPage.module.scss';

import { InfoList } from './InfoList';
import { ResourceEventTable } from './ResourceEventTable';

const RECENT_EVENT_LIMIT = 5;

export interface ResourceOverviewTabProps {
  resource: Resource;
  /** 이 리소스의 이벤트(최신순) */
  events: CloudEvent[];
}

/** 개요: 기본 정보, 현재 사용률, 최근 이벤트 5건(설계서 3-2) */
export function ResourceOverviewTab({ resource, events }: ResourceOverviewTabProps) {
  const provider = PROVIDERS[resource.provider];
  const region = provider.regions.find((item) => item.code === resource.region);
  const spec = findInstanceType(resource.provider, resource.instanceType);
  const recent = events.slice(0, RECENT_EVENT_LIMIT);

  return (
    <div className={styles.tabLayout}>
      <div className={styles.overviewGrid}>
        <Panel title="기본 정보">
          <InfoList
            items={[
              { label: '리소스명', value: resource.name },
              { label: '리소스 ID', value: resource.id, mono: true },
              { label: '클라우드 제공업체', value: <Badge>{provider.label}</Badge> },
              { label: '상태', value: <StatusBadge status={resource.status} /> },
              {
                label: '리전',
                value: (
                  <>
                    <span className={styles.mono}>{resource.region}</span>
                    {region && <span className={styles.inlineSub}>{region.label}</span>}
                  </>
                ),
              },
              {
                label: '인스턴스 유형',
                value: (
                  <>
                    <span className={styles.mono}>{resource.instanceType}</span>
                    {spec && (
                      <span className={styles.inlineSub}>
                        vCPU {spec.vcpu}개 · 메모리 {spec.memoryGib} GiB
                      </span>
                    )}
                  </>
                ),
              },
              { label: '운영체제', value: resource.os },
              {
                label: '생성일',
                value: (
                  <time dateTime={resource.createdAt}>{formatDateTime(resource.createdAt)}</time>
                ),
              },
              { label: '사설 IP', value: resource.privateIp, mono: true },
              { label: '공인 IP', value: resource.publicIp, mono: true },
              {
                label: '모니터링 수집',
                value: resource.monitoringEnabled ? '사용' : '사용 안 함',
              },
            ]}
          />
        </Panel>

        <Panel title="현재 사용률" description="모니터링 기준 시각의 값 · 경고 70% · 위험 90%">
          <ul className={styles.usageList}>
            <li>
              <UsageBar variant="full" label="CPU" value={resource.cpuUsage} />
            </li>
            <li>
              <UsageBar variant="full" label="메모리" value={resource.memoryUsage} />
            </li>
            <li>
              <UsageBar
                variant="full"
                label="디스크"
                meta={`${formatNumber(resource.diskSizeGb)} GB`}
                value={resource.diskUsage}
              />
            </li>
          </ul>
        </Panel>
      </div>

      <Panel
        title="최근 이벤트"
        description={`최신 ${String(recent.length)}건 · 전체 기록은 이벤트 로그 탭에서 확인합니다.`}
        flush
      >
        {recent.length === 0 ? (
          <p className={styles.empty}>이 리소스의 이벤트가 없습니다.</p>
        ) : (
          <ResourceEventTable caption="최근 이벤트" events={recent} />
        )}
      </Panel>
    </div>
  );
}
