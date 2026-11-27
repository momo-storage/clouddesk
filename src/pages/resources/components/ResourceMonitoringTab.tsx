import { useState, type ReactNode } from 'react';

import { CHART_COLOR, ChartSkeleton, MetricChart, type MetricRow } from '@/components/charts';
import { Panel } from '@/components/layout/Panel';
import { RadioGroup } from '@/components/ui/Radio';
import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getMetricSeries } from '@/services/metricService';
import type { MetricPeriod } from '@/types/metric';
import type { Resource } from '@/types/resource';
import {
  formatDateTime,
  formatMonthDay,
  formatNumber,
  formatPercent,
  formatTime,
} from '@/utils/format';

import styles from '../ResourceDetailPage.module.scss';

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
];

const DISK_SERIES = [{ key: 'disk', label: '디스크', color: CHART_COLOR.disk }];

interface MonitoringData {
  usage: MetricRow[];
  disk: MetricRow[];
}

/** 세 지표를 한 번에 불러와 두 차트가 같은 기간·같은 시점을 쓰게 한다. */
async function loadMonitoring(resource: Resource, period: MetricPeriod): Promise<MonitoringData> {
  const [cpu, memory, disk] = await Promise.all([
    getMetricSeries(resource, 'cpu', period),
    getMetricSeries(resource, 'memory', period),
    getMetricSeries(resource, 'disk', period),
  ]);
  return {
    usage: cpu.points.map((point, index) => ({
      timestamp: point.timestamp,
      cpu: point.value,
      memory: memory.points[index]?.value ?? 0,
    })),
    disk: disk.points.map((point) => ({ timestamp: point.timestamp, disk: point.value })),
  };
}

const average = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;
const periodName = (period: MetricPeriod) => PERIOD_DESCRIPTION[period].split(' · ')[0] ?? '';

/** CPU·메모리 차트의 핵심(평균·최고)을 한 문장으로 요약한다. */
function describeUsage(rows: MetricRow[], period: MetricPeriod): string {
  const values = (key: 'cpu' | 'memory') => rows.map((row) => Number(row[key]));
  const cpu = values('cpu');
  const peak = Math.max(...cpu);
  const peakRow = rows[cpu.indexOf(peak)];
  const peakTime = peakRow
    ? period === '7d'
      ? formatDateTime(peakRow.timestamp)
      : formatTime(peakRow.timestamp)
    : '';
  return `${periodName(period)} 평균 사용률은 CPU ${formatPercent(average(cpu))}%, 메모리 ${formatPercent(average(values('memory')))}%입니다. CPU는 ${peakTime}에 ${formatPercent(peak)}%로 가장 높았습니다.`;
}

/** 디스크 차트 요약: 기간 시작과 끝의 사용률 변화 */
function describeDisk(rows: MetricRow[], period: MetricPeriod): string {
  const first = Number(rows[0]?.disk ?? 0);
  const last = Number(rows.at(-1)?.disk ?? 0);
  const change = last - first;
  return `${periodName(period)} 디스크 사용률은 ${formatPercent(first)}%에서 ${formatPercent(last)}%로 ${change > 0 ? `${formatPercent(change)}%p 늘었습니다` : '변화가 없습니다'}.`;
}

/** 모니터링: CPU·메모리 / 디스크 사용률 시계열, 조회 기간 1시간/24시간/7일(설계서 3-2) */
export function ResourceMonitoringTab({ resource }: { resource: Resource }) {
  const [period, setPeriod] = useState<MetricPeriod>('24h');
  const inactive = resource.status === 'stopped' || resource.status === 'error';
  // 수집이 꺼져 있으면 조회하지 않는다(key를 바꿔 이전 결과도 버린다).
  const data = useAsyncValue(
    resource.monitoringEnabled ? `${resource.id}:${period}` : 'disabled',
    () =>
      resource.monitoringEnabled
        ? loadMonitoring(resource, period)
        : Promise.resolve({ usage: [], disk: [] }),
  );
  const formatTick = period === '7d' ? formatMonthDay : formatTime;

  const chartBody = (render: (value: MonitoringData) => ReactNode) =>
    data.status === 'loading' ? (
      <ChartSkeleton label="사용량 차트를 불러오는 중" />
    ) : data.status === 'error' ? (
      <p className={styles.empty}>사용량 데이터를 불러오지 못했습니다.</p>
    ) : (
      render(data.data)
    );

  return (
    <div className={styles.tabLayout}>
      <div className={styles.toolbar}>
        <RadioGroup
          legend="조회 기간"
          orientation="horizontal"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />
        <p className={styles.asOf}>
          기준 <time dateTime={DEMO_REFERENCE_TIME}>{formatDateTime(DEMO_REFERENCE_TIME)}</time>{' '}
          (KST)
        </p>
      </div>

      {!resource.monitoringEnabled ? (
        <Panel title="사용률" description={PERIOD_DESCRIPTION[period]}>
          <p className={styles.empty}>
            모니터링 수집이 꺼져 있어 사용량 기록이 없습니다. 리소스 수정에서 모니터링 수집을 켤 수
            있습니다.
          </p>
        </Panel>
      ) : (
        <>
          <Panel title="CPU·메모리 사용률" description={PERIOD_DESCRIPTION[period]}>
            {inactive && (
              <p className={styles.notice}>
                현재 {resource.status === 'stopped' ? '중지' : '오류'} 상태라 CPU·메모리 사용량이
                0%로 기록됩니다.
              </p>
            )}
            {chartBody((value) => (
              <>
                <p className={styles.chartSummary}>{describeUsage(value.usage, period)}</p>
                <MetricChart
                  title={`${resource.name} CPU·메모리 사용률(${PERIOD_DESCRIPTION[period]})`}
                  data={value.usage}
                  series={SERIES}
                  unit="%"
                  showThresholds
                  height={280}
                  formatTick={formatTick}
                />
              </>
            ))}
          </Panel>

          <Panel
            title="디스크 사용률"
            description={`${PERIOD_DESCRIPTION[period]} · 용량 ${formatNumber(resource.diskSizeGb)} GB`}
          >
            {chartBody((value) => (
              <>
                <p className={styles.chartSummary}>{describeDisk(value.disk, period)}</p>
                <MetricChart
                  title={`${resource.name} 디스크 사용률(${PERIOD_DESCRIPTION[period]})`}
                  data={value.disk}
                  series={DISK_SERIES}
                  unit="%"
                  showThresholds
                  height={200}
                  formatTick={formatTick}
                />
              </>
            ))}
          </Panel>
        </>
      )}
    </div>
  );
}
