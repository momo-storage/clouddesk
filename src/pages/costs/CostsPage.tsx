import { CalendarRange, CircleDollarSign, History, Wallet } from 'lucide-react';
import { useState } from 'react';

import { CategoryBarChart, CHART_COLOR } from '@/components/charts';
import { StatCard } from '@/components/data/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/layout/Panel';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { COST_CATEGORY_KEYS, COST_CATEGORY_LABEL } from '@/constants/costs';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getCostRecords } from '@/services/costService';
import { getMonthlyCostByProvider, getMonthlyCostSummary } from '@/services/dashboard';
import type { CostCategory } from '@/types/cost';
import type { CloudProvider } from '@/types/resource';
import { formatMonth, formatUsd } from '@/utils/format';

import { CostBreakdownTable } from './components/CostBreakdownTable';
import { COST_PERIODS, getBreakdown, getMonths, sumAmount, type CostPeriod } from './costSummary';
import styles from './CostsPage.module.scss';

/** 축 눈금은 천 달러 단위로 줄인다(대시보드 월별 비용 추이와 같은 표기). */
const formatAxis = (value: number) => `$${String(Math.round(value / 100) / 10)}k`;

/** 차트 요약 문장: 기간 첫 달과 마지막 달 비교 */
function describeTrend(totals: number[], periodLabel: string): string {
  const first = totals[0] ?? 0;
  const last = totals.at(-1) ?? 0;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  return `${periodLabel} 동안 월 비용은 ${formatUsd(first)}에서 ${formatUsd(last)}로 ${Math.abs(change).toFixed(1)}% ${change >= 0 ? '증가' : '감소'}했습니다.`;
}

/**
 * 비용 관리(설계서 3-3, 포트폴리오 범위로 간소화).
 * - 데이터는 대시보드와 같은 Mock 비용 서비스·집계 함수를 써서 "이번 달 비용"이 대시보드와 일치한다.
 * - 제공업체 필터는 화면 전체에, 조회 기간은 추이 차트와 두 내역 표의 기간 합계에 적용한다.
 * - 필터는 화면 상태로 둔다(모니터링 화면과 같은 방식).
 */
export function CostsPage() {
  const costs = useAsyncValue('costs', () => getCostRecords());
  const [provider, setProvider] = useState<CloudProvider | ''>('');
  const [period, setPeriod] = useState<CostPeriod>(6);

  const all = costs.status === 'ready' ? costs.data : [];
  const records = provider ? all.filter((record) => record.provider === provider) : all;
  const months = getMonths(records).slice(-period);
  const periodRecords = records.filter((record) => months.includes(record.month));
  const summary = getMonthlyCostSummary(records);
  const periodTotal = sumAmount(periodRecords);
  const periodLabel = `최근 ${String(period)}개월`;
  const scopeLabel = provider ? PROVIDERS[provider].label : '전체 제공업체';

  const trendRows = getMonthlyCostByProvider(records, period);
  const trendSeries = (provider ? [provider] : PROVIDER_KEYS).map((key) => ({
    key,
    label: PROVIDERS[key].label,
    color: CHART_COLOR[key],
  }));

  const providerRows = getBreakdown(
    periodRecords,
    months,
    PROVIDER_KEYS,
    (record) => record.provider,
  );
  const categoryRows = getBreakdown(
    periodRecords,
    months,
    COST_CATEGORY_KEYS,
    (record) => record.category,
  );

  return (
    <>
      <PageHeader
        title="비용 관리"
        description="AWS, Azure, GCP 청구 비용을 월별·제공업체별·서비스 유형별로 확인합니다."
      />

      <div className={styles.layout}>
        <div className={styles.filters}>
          <Select
            label="제공업체"
            placeholder="전체"
            value={provider}
            options={PROVIDER_KEYS.map((key) => ({ value: key, label: PROVIDERS[key].label }))}
            onChange={(event) => {
              setProvider(event.target.value as CloudProvider | '');
            }}
            fieldClassName={styles.filterField}
          />
          <Select
            label="조회 기간"
            value={String(period)}
            options={COST_PERIODS.map((value) => ({
              value: String(value),
              label: `최근 ${String(value)}개월`,
            }))}
            onChange={(event) => {
              setPeriod(Number(event.target.value) as CostPeriod);
            }}
            fieldClassName={styles.filterField}
          />
          <p className={styles.unitNote}>금액 단위: USD · 데모용 Mock 청구 데이터</p>
        </div>

        {costs.status === 'loading' ? (
          <div className={styles.kpis} aria-busy="true">
            <VisuallyHidden>비용 데이터를 불러오는 중</VisuallyHidden>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.kpiSkeleton}>
                <Skeleton width="40%" />
                <Skeleton width="55%" height={32} />
              </div>
            ))}
          </div>
        ) : costs.status === 'error' || !summary ? (
          <EmptyState
            icon={Wallet}
            title="비용 데이터를 불러오지 못했습니다"
            description="페이지를 새로고침해 주세요."
            className={styles.panelEmpty}
          />
        ) : (
          <>
            <div className={styles.kpis}>
              <StatCard
                icon={CircleDollarSign}
                label="이번 달 비용"
                value={formatUsd(summary.total)}
                detail={`${formatMonth(summary.month)} · ${scopeLabel}`}
                change={
                  summary.changeRate === null
                    ? undefined
                    : { rate: summary.changeRate, label: '전월 대비' }
                }
              />
              <StatCard
                icon={History}
                tone="neutral"
                label="전월 비용"
                value={summary.previousTotal === null ? '—' : formatUsd(summary.previousTotal)}
                detail={
                  summary.previousMonth ? formatMonth(summary.previousMonth) : '전월 기록 없음'
                }
              />
              <StatCard
                icon={CalendarRange}
                tone="neutral"
                label={`${periodLabel} 합계`}
                value={formatUsd(periodTotal)}
                detail={`${formatMonth(months[0] ?? '')} ~ ${formatMonth(months.at(-1) ?? '')}`}
              />
              <StatCard
                icon={Wallet}
                tone="neutral"
                label="월평균 비용"
                value={formatUsd(months.length > 0 ? periodTotal / months.length : 0)}
                detail={`${periodLabel} 기준`}
              />
            </div>

            <Panel
              title="월별 비용 추이"
              description={`${periodLabel} · ${scopeLabel}${provider ? '' : ' · 제공업체별 누적'}`}
            >
              <p className={styles.chartSummary}>
                {describeTrend(
                  trendRows.map((row) => row.aws + row.azure + row.gcp),
                  periodLabel,
                )}
              </p>
              <CategoryBarChart
                title={`월별 비용(${periodLabel}, ${scopeLabel})`}
                data={trendRows}
                categoryKey="month"
                categoryLabel="월"
                series={trendSeries}
                formatCategory={(month) => formatMonth(month, true)}
                formatValue={formatUsd}
                formatAxis={formatAxis}
                unitLabel="USD"
                height={320}
              />
            </Panel>

            <div className={styles.tables}>
              {!provider && (
                <Panel
                  title="제공업체별 비용 비중"
                  description={`${periodLabel} 합계 기준 · 비용이 큰 순`}
                  flush
                >
                  <CostBreakdownTable
                    caption="제공업체별 비용 내역"
                    keyLabel="제공업체"
                    rows={providerRows}
                    renderKey={(key) => <Badge>{PROVIDERS[key as CloudProvider].label}</Badge>}
                    barColor={(key) => CHART_COLOR[key as CloudProvider]}
                    periodLabel={periodLabel}
                  />
                </Panel>
              )}
              <Panel
                title="서비스 유형별 비용"
                description={`${periodLabel} 합계 기준 · ${scopeLabel} · 비용이 큰 순`}
                flush
              >
                <CostBreakdownTable
                  caption="서비스 유형별 비용 내역"
                  keyLabel="서비스 유형"
                  rows={categoryRows}
                  renderKey={(key) => (
                    <>
                      {COST_CATEGORY_LABEL[key as CostCategory]}
                      {provider && (
                        <span className={styles.serviceName}>
                          {PROVIDERS[provider].services[key as CostCategory]}
                        </span>
                      )}
                    </>
                  )}
                  periodLabel={periodLabel}
                />
              </Panel>
            </div>
          </>
        )}
      </div>
    </>
  );
}
