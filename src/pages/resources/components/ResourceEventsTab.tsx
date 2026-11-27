import { useState } from 'react';

import { Panel } from '@/components/layout/Panel';
import { Select } from '@/components/ui/Select';
import { EVENT_SEVERITY_LABEL } from '@/constants/resourceStatus';
import type { CloudEvent, EventSeverity } from '@/types/event';
import { formatNumber } from '@/utils/format';

import styles from '../ResourceDetailPage.module.scss';

import { ResourceEventTable } from './ResourceEventTable';

const SEVERITIES: EventSeverity[] = ['critical', 'warning', 'info'];

/** 이벤트 로그: 심각도 필터, 시간 역순 표(설계서 3-2) */
export function ResourceEventsTab({ events }: { events: CloudEvent[] }) {
  const [severity, setSeverity] = useState<EventSeverity | ''>('');
  const filtered = severity ? events.filter((event) => event.severity === severity) : events;

  return (
    <div className={styles.tabLayout}>
      <Panel
        title="이벤트 로그"
        description={
          // 필터 결과 건수를 알린다(초점은 옮기지 않는다).
          <span role="status">
            {severity
              ? `${EVENT_SEVERITY_LABEL[severity]} ${formatNumber(filtered.length)}건 · 전체 ${formatNumber(events.length)}건`
              : `전체 ${formatNumber(events.length)}건 · 최신순`}
          </span>
        }
        actions={
          <Select
            label="심각도"
            placeholder="전체"
            value={severity}
            options={SEVERITIES.map((key) => ({ value: key, label: EVENT_SEVERITY_LABEL[key] }))}
            onChange={(event) => {
              setSeverity(event.target.value as EventSeverity | '');
            }}
            fieldClassName={styles.inlineField}
            className={styles.inlineSelect}
          />
        }
        flush
      >
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {events.length === 0
              ? '이 리소스의 이벤트가 없습니다.'
              : '선택한 심각도의 이벤트가 없습니다.'}
          </p>
        ) : (
          <ResourceEventTable caption="이벤트 로그" events={filtered} />
        )}
      </Panel>
    </div>
  );
}
