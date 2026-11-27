import { CategoryBarChart, CHART_COLOR, ChartSkeleton } from '@/components/charts';
import { Panel } from '@/components/layout/Panel';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import type { AsyncValue } from '@/hooks/useAsyncValue';
import { getMonthlyCostByProvider, type MonthlyProviderCost } from '@/services/dashboard';
import type { CostRecord } from '@/types/cost';
import { formatMonth, formatUsd } from '@/utils/format';

import styles from '../DashboardPage.module.scss';

const MONTH_COUNT = 6;

const SERIES = PROVIDER_KEYS.map((provider) => ({
  key: provider,
  label: PROVIDERS[provider].label,
  color: CHART_COLOR[provider],
}));

const total = (row: MonthlyProviderCost) => row.aws + row.azure + row.gcp;

/** 축 눈금은 천 달러 단위로 줄인다(예: $11k). 정확한 값은 Tooltip과 대체 데이터 표에 있다. */
const formatAxis = (value: number) => `$${String(Math.round(value / 100) / 10)}k`;

function describe(rows: MonthlyProviderCost[]): string {
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) return '';
  const change = ((total(last) - total(first)) / total(first)) * 100;
  const share = PROVIDER_KEYS.map(
    (provider) =>
      `${PROVIDERS[provider].label} ${String(Math.round((last[provider] / total(last)) * 100))}%`,
  ).join(', ');
  return `최근 ${String(rows.length)}개월 비용은 ${formatUsd(total(first))}에서 ${formatUsd(total(last))}로 ${change >= 0 ? '' : '-'}${Math.abs(change).toFixed(1)}% ${change >= 0 ? '증가' : '감소'}했습니다. 이번 달 비중은 ${share}입니다.`;
}

export interface CostTrendPanelProps {
  costs: AsyncValue<CostRecord[]>;
}

/** 월별 비용 추이: 최근 6개월, 제공업체별 누적 막대(설계서 3-2) */
export function CostTrendPanel({ costs }: CostTrendPanelProps) {
  const rows = costs.status === 'ready' ? getMonthlyCostByProvider(costs.data, MONTH_COUNT) : [];

  return (
    <Panel
      title="월별 비용 추이"
      description={`최근 ${String(MONTH_COUNT)}개월 · 제공업체별 · USD`}
    >
      {costs.status === 'loading' ? (
        <ChartSkeleton label="비용 추이를 불러오는 중" height={340} />
      ) : costs.status === 'error' || rows.length === 0 ? (
        <p className={styles.empty}>비용 데이터를 불러오지 못했습니다.</p>
      ) : (
        <>
          <p className={styles.chartSummary}>{describe(rows)}</p>
          <CategoryBarChart
            title="월별 제공업체별 비용(최근 6개월)"
            data={rows}
            categoryKey="month"
            categoryLabel="월"
            series={SERIES}
            formatCategory={(month) => formatMonth(month, true)}
            formatValue={formatUsd}
            formatAxis={formatAxis}
            unitLabel="USD"
            height={340}
          />
        </>
      )}
    </Panel>
  );
}
