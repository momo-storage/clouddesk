import { CategoryBarChart, CHART_COLOR, ChartSkeleton } from '@/components/charts';
import { Panel } from '@/components/layout/Panel';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { RESOURCE_STATUS_LABEL } from '@/constants/resourceStatus';
import type { ResourceSummary } from '@/services/dashboard';
import { formatNumber } from '@/utils/format';

import styles from '../DashboardPage.module.scss';

/** 누적 순서: 정상(실행 중) → 주의(전환 중·오류) → 중지됨 */
const SERIES = [
  { key: 'running', label: RESOURCE_STATUS_LABEL.running, color: CHART_COLOR.running },
  { key: 'pending', label: RESOURCE_STATUS_LABEL.pending, color: CHART_COLOR.pending },
  { key: 'error', label: RESOURCE_STATUS_LABEL.error, color: CHART_COLOR.error },
  { key: 'stopped', label: RESOURCE_STATUS_LABEL.stopped, color: CHART_COLOR.stopped },
];

export interface ProviderStatusPanelProps {
  summary: ResourceSummary | null;
}

/** 클라우드 제공업체별 리소스 현황: 제공업체별 상태 건수 누적 막대(설계서 3-2) */
export function ProviderStatusPanel({ summary }: ProviderStatusPanelProps) {
  const rows = summary
    ? PROVIDER_KEYS.map((provider) => ({
        provider: PROVIDERS[provider].label,
        ...summary.byProvider[provider],
      }))
    : [];

  return (
    <Panel
      title="제공업체별 리소스 현황"
      description={summary ? `전체 ${formatNumber(summary.total)}대 · 상태별 대수` : '상태별 대수'}
    >
      {summary ? (
        <>
          <p className={styles.chartSummary}>
            {rows
              .map(
                (row) =>
                  `${row.provider} ${String(row.total)}대(실행 중 ${String(row.running)}, 오류 ${String(row.error)})`,
              )
              .join(', ')}
            입니다.
          </p>
          <CategoryBarChart
            title="제공업체별 상태별 리소스 수"
            data={rows}
            categoryKey="provider"
            categoryLabel="제공업체"
            series={SERIES}
            orientation="horizontal"
            formatValue={formatNumber}
            unitLabel="대"
            height={262}
          />
        </>
      ) : (
        <ChartSkeleton label="제공업체별 현황을 불러오는 중" height={262} />
      )}
    </Panel>
  );
}
