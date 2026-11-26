import { Info } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getCostRecords } from '@/services/costService';
import { getMonthlyCostSummary, summarizeResources } from '@/services/dashboard';
import { useDemoData } from '@/store/demoData/demoDataContext';
import { formatDateTime } from '@/utils/format';

import { CostTrendPanel } from './components/CostTrendPanel';
import { KpiSummary } from './components/KpiSummary';
import { ProviderStatusPanel } from './components/ProviderStatusPanel';
import { RecentEventsPanel } from './components/RecentEventsPanel';
import { TopResourcesPanel } from './components/TopResourcesPanel';
import { UsageTrendPanel } from './components/UsageTrendPanel';
import styles from './DashboardPage.module.scss';

/**
 * 대시보드. 모든 수치는 상태(리소스·이벤트)와 Mock 서비스(비용·시계열)에서 계산한다.
 * 리소스를 등록·삭제하면 지표·차트·표가 같은 데이터로 다시 계산된다.
 */
export function DashboardPage() {
  const { state } = useDemoData();
  const ready = state.status === 'ready';
  const costs = useAsyncValue('costs', () => getCostRecords());

  const summary = useMemo(
    () => (ready ? summarizeResources(state.resources) : null),
    [ready, state.resources],
  );
  const runningResources = useMemo(
    () => (ready ? state.resources.filter((resource) => resource.status === 'running') : null),
    [ready, state.resources],
  );
  const resourceIds = useMemo(
    () => new Set(state.resources.map((resource) => resource.id)),
    [state.resources],
  );
  const costSummary =
    costs.status === 'ready'
      ? { status: 'ready' as const, data: getMonthlyCostSummary(costs.data) }
      : costs;

  return (
    <>
      <PageHeader
        title="대시보드"
        description="AWS, Azure, GCP 리소스와 비용 현황을 한 화면에서 확인합니다."
        actions={
          <p className={styles.asOf}>
            모니터링·비용 기준{' '}
            <time dateTime={DEMO_REFERENCE_TIME}>{formatDateTime(DEMO_REFERENCE_TIME)}</time> (KST)
          </p>
        }
      />
      <p className={styles.demoNotice}>
        <Info size={16} className={styles.demoIcon} aria-hidden="true" />
        Mock Data 기반 데모입니다. 실제 클라우드 리소스를 제어하지 않으며, 변경 내용은 이
        브라우저에만 저장됩니다.
      </p>

      <div className={styles.layout}>
        <KpiSummary summary={summary} cost={costSummary} />
        <div className={styles.rowWide}>
          <UsageTrendPanel runningResources={runningResources} />
          <ProviderStatusPanel summary={summary} />
        </div>
        <div className={styles.rowEven}>
          <CostTrendPanel costs={costs} />
          <RecentEventsPanel events={ready ? state.events : null} resourceIds={resourceIds} />
        </div>
        <TopResourcesPanel resources={ready ? state.resources : null} />
      </div>
    </>
  );
}
