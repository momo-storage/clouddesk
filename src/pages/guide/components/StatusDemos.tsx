import { SeverityBadge } from '@/components/data/SeverityBadge';
import { StatusBadge } from '@/components/data/StatusBadge';
import { UsageBar } from '@/components/data/UsageBar';
import { RESOURCE_STATUS_KEYS } from '@/constants/resourceStatus';
import type { EventSeverity } from '@/types/event';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';

const SEVERITIES: EventSeverity[] = ['info', 'warning', 'critical'];

export function StatusBadgeDemo() {
  return (
    <GuideSection id="status-badge" title="StatusBadge · SeverityBadge">
      <GuideExample label="StatusBadge: 리소스 상태 4종">
        {RESOURCE_STATUS_KEYS.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </GuideExample>
      <GuideExample label="SeverityBadge: 이벤트 심각도 3종">
        {SEVERITIES.map((severity) => (
          <SeverityBadge key={severity} severity={severity} />
        ))}
      </GuideExample>
    </GuideSection>
  );
}

export function UsageBarDemo() {
  return (
    <GuideSection id="usage-bar" title="UsageBar">
      <GuideExample label="기본(compact): 표 셀용 · 정상 / 경고 / 위험">
        <div className={styles.stack}>
          <UsageBar value={34.5} />
          <UsageBar value={76.2} />
          <UsageBar value={93.8} />
        </div>
      </GuideExample>
      <GuideExample label="full: 카드용 · 항목명과 수치 위, 막대가 너비를 채움" wide>
        <div className={styles.usageGrid}>
          <UsageBar variant="full" label="CPU" value={34.5} />
          <UsageBar variant="full" label="메모리" value={76.2} />
          <UsageBar variant="full" label="디스크" meta="100 GB" value={93.8} />
        </div>
      </GuideExample>
    </GuideSection>
  );
}
