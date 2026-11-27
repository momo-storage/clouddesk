import { Activity, Cpu, HardDrive, MemoryStick, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CHART_COLOR, ChartSkeleton, MetricChart, type MetricRow } from '@/components/charts';
import { StatCard } from '@/components/data/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/layout/Panel';
import { EmptyState } from '@/components/ui/EmptyState';
import { RadioGroup } from '@/components/ui/Radio';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { getThresholdLevel, USAGE_THRESHOLD } from '@/constants/thresholds';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getAverageSeries, getMetricSeries } from '@/services/metricService';
import { useDemoData } from '@/store/demoData/demoDataContext';
import type { MetricName, MetricPeriod, MetricPoint } from '@/types/metric';
import type { CloudProvider, Resource } from '@/types/resource';
import {
  formatDateTime,
  formatMonthDay,
  formatNumber,
  formatPercent,
  formatTime,
} from '@/utils/format';

import { MonitoringResourceTable } from './components/MonitoringResourceTable';
import styles from './MonitoringPage.module.scss';

const PERIOD_OPTIONS: { value: MetricPeriod; label: string }[] = [
  { value: '1h', label: '1시간' },
  { value: '24h', label: '24시간' },
  { value: '7d', label: '7일' },
];

const PERIOD_DESCRIPTION: Record<MetricPeriod, string> = {
  '1h': '최근 1시간 · 5분 간격',
  '24h': '최근 24시간 · 30분 간격',
  '7d': '최근 7일 · 2시간 간격',
};

const SERIES = [
  { key: 'cpu', label: 'CPU', color: CHART_COLOR.cpu },
  { key: 'memory', label: '메모리', color: CHART_COLOR.memory },
  { key: 'disk', label: '디스크', color: CHART_COLOR.disk },
];

const METRICS: MetricName[] = ['cpu', 'memory', 'disk'];

/** 사용률이 기록되는 리소스: 실행 중이고 모니터링 수집이 켜진 리소스(중지·오류는 0%라 평균을 왜곡한다) */
function isMonitored(resource: Resource): boolean {
  return resource.status === 'running' && resource.monitoringEnabled;
}

/** 선택한 리소스 한 대의 시계열, 또는 대상 리소스 평균 시계열을 CPU·메모리·디스크 한 표로 합친다. */
async function loadTrend(
  targets: Resource[],
  selected: Resource | undefined,
  period: MetricPeriod,
): Promise<MetricRow[]> {
  const series: MetricPoint[][] = await Promise.all(
    METRICS.map((metric) =>
      selected
        ? getMetricSeries(selected, metric, period).then((result) => result.points)
        : getAverageSeries(targets, metric, period),
    ),
  );
  const [cpu = [], memory = [], disk = []] = series;
  return cpu.map((point, index) => ({
    timestamp: point.timestamp,
    cpu: point.value,
    memory: memory[index]?.value ?? 0,
    disk: disk[index]?.value ?? 0,
  }));
}

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * 모니터링(설계서 3-3, 포트폴리오 범위로 간소화).
 * - 대상: 실행 중이고 모니터링 수집이 켜진 리소스. 제공업체·리소스로 좁힌다.
 * - 지표 카드는 현재 사용률(시계열의 마지막 값과 같다), 차트는 선택한 기간의 추이다.
 * - 필터·기간은 화면 상태로 둔다(리소스 상세의 조회 기간과 같은 방식).
 */
export function MonitoringPage() {
  const { state } = useDemoData();
  const [provider, setProvider] = useState<CloudProvider | ''>('');
  const [resourceId, setResourceId] = useState('');
  const [period, setPeriod] = useState<MetricPeriod>('24h');

  const ready = state.status === 'ready';
  const targets = useMemo(
    () =>
      state.resources.filter(
        (resource) => isMonitored(resource) && (provider === '' || resource.provider === provider),
      ),
    [state.resources, provider],
  );
  // 제공업체를 바꿔 선택한 리소스가 대상에서 빠지면 전체 평균으로 돌아간다.
  const selected = targets.find((resource) => resource.id === resourceId);
  const scope = selected ? [selected] : targets;

  const trend = useAsyncValue(
    `${period}:${selected?.id ?? 'all'}:${targets.map((resource) => resource.id).join(',')}`,
    () => loadTrend(targets, selected, period),
  );

  const current = {
    cpu: average(scope.map((resource) => resource.cpuUsage)),
    memory: average(scope.map((resource) => resource.memoryUsage)),
    disk: average(scope.map((resource) => resource.diskUsage)),
  };
  const levels = scope.map((resource) =>
    getThresholdLevel(Math.max(resource.cpuUsage, resource.memoryUsage, resource.diskUsage)),
  );
  const criticalCount = levels.filter((level) => level === 'critical').length;
  const warningCount = levels.filter((level) => level === 'warning').length;
  const scopeLabel = selected
    ? selected.name
    : `${provider ? PROVIDERS[provider].label : '전체'} 리소스 ${formatNumber(targets.length)}대 평균`;

  return (
    <>
      <PageHeader
        title="모니터링"
        description="실행 중인 리소스의 CPU·메모리·디스크 사용률과 추이를 확인합니다."
        actions={
          <p className={styles.asOf}>
            기준 <time dateTime={DEMO_REFERENCE_TIME}>{formatDateTime(DEMO_REFERENCE_TIME)}</time>{' '}
            (KST)
          </p>
        }
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
            label="리소스"
            placeholder="전체 평균"
            value={selected?.id ?? ''}
            options={targets.map((resource) => ({ value: resource.id, label: resource.name }))}
            onChange={(event) => {
              setResourceId(event.target.value);
            }}
            fieldClassName={styles.resourceField}
          />
          <RadioGroup
            legend="조회 기간"
            orientation="horizontal"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
        </div>

        {!ready ? (
          <div className={styles.kpis} aria-busy="true">
            <VisuallyHidden>모니터링 지표를 불러오는 중</VisuallyHidden>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.kpiSkeleton}>
                <Skeleton width="40%" />
                <Skeleton width="55%" height={32} />
              </div>
            ))}
          </div>
        ) : targets.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="모니터링 중인 리소스가 없습니다"
            description="실행 중이고 모니터링 수집이 켜진 리소스가 없습니다. 제공업체 조건을 바꾸거나 리소스 관리에서 모니터링 수집을 켜세요."
            className={styles.panelEmpty}
          />
        ) : (
          <>
            <div className={styles.kpis}>
              <StatCard
                icon={Cpu}
                label="CPU 사용률"
                value={formatPercent(current.cpu)}
                unit="%"
                detail={scopeLabel}
              />
              <StatCard
                icon={MemoryStick}
                label="메모리 사용률"
                value={formatPercent(current.memory)}
                unit="%"
                detail={scopeLabel}
              />
              <StatCard
                icon={HardDrive}
                label="디스크 사용률"
                value={formatPercent(current.disk)}
                unit="%"
                detail={scopeLabel}
              />
              <StatCard
                icon={TriangleAlert}
                tone="neutral"
                label="임계치 초과"
                value={formatNumber(criticalCount + warningCount)}
                unit="대"
                detail={`위험(${String(USAGE_THRESHOLD.critical)}% 이상) ${String(criticalCount)}대 · 경고(${String(USAGE_THRESHOLD.warning)}% 이상) ${String(warningCount)}대`}
              />
            </div>

            <Panel
              title="사용률 추이"
              description={`${scopeLabel} · ${PERIOD_DESCRIPTION[period]}`}
            >
              {trend.status === 'loading' ? (
                <ChartSkeleton label="사용률 추이를 불러오는 중" height={300} />
              ) : trend.status === 'error' ? (
                <p className={styles.empty}>사용률 데이터를 불러오지 못했습니다.</p>
              ) : (
                <>
                  <p className={styles.chartSummary}>
                    {PERIOD_DESCRIPTION[period].split(' · ')[0]} 평균 사용률은 CPU{' '}
                    {formatPercent(average(trend.data.map((row) => Number(row.cpu))))}%, 메모리{' '}
                    {formatPercent(average(trend.data.map((row) => Number(row.memory))))}%, 디스크{' '}
                    {formatPercent(average(trend.data.map((row) => Number(row.disk))))}%입니다.
                  </p>
                  <MetricChart
                    title={`${scopeLabel} 사용률 추이(${PERIOD_DESCRIPTION[period]})`}
                    data={trend.data}
                    series={SERIES}
                    unit="%"
                    showThresholds
                    height={300}
                    formatTick={period === '7d' ? formatMonthDay : formatTime}
                  />
                </>
              )}
            </Panel>

            <MonitoringResourceTable resources={targets} selectedId={selected?.id} />
          </>
        )}
      </div>
    </>
  );
}
