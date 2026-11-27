import { CHART_COLOR, ChartSkeleton, MetricChart, type MetricRow } from '@/components/charts';
import { Panel } from '@/components/layout/Panel';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getAverageSeries } from '@/services/metricService';
import type { Resource } from '@/types/resource';
import { formatPercent, formatTime } from '@/utils/format';

import styles from '../DashboardPage.module.scss';

const SERIES = [
  { key: 'cpu', label: 'CPU', color: CHART_COLOR.cpu },
  { key: 'memory', label: '메모리', color: CHART_COLOR.memory },
];

async function loadAverageUsage(resources: Resource[]): Promise<MetricRow[]> {
  const [cpu, memory] = await Promise.all([
    getAverageSeries(resources, 'cpu', '24h'),
    getAverageSeries(resources, 'memory', '24h'),
  ]);
  return cpu.map((point, index) => ({
    timestamp: point.timestamp,
    cpu: point.value,
    memory: memory[index]?.value ?? 0,
  }));
}

/** 차트 내용을 한 문장으로 요약한다(차트를 볼 수 없는 사용자를 위한 핵심 정보). */
function describe(rows: MetricRow[], count: number): string {
  const values = (key: 'cpu' | 'memory') => rows.map((row) => Number(row[key]));
  const average = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;
  const cpu = values('cpu');
  const peak = Math.max(...cpu);
  const peakRow = rows[cpu.indexOf(peak)];
  return `실행 중 리소스 ${String(count)}대의 최근 24시간 평균 사용률은 CPU ${formatPercent(average(cpu))}%, 메모리 ${formatPercent(average(values('memory')))}%입니다. CPU는 ${peakRow ? formatTime(peakRow.timestamp) : ''}에 ${formatPercent(peak)}%로 가장 높았습니다.`;
}

function UsageTrendChart({ resources }: { resources: Resource[] }) {
  const usage = useAsyncValue(resources.map((resource) => resource.id).join(','), () =>
    loadAverageUsage(resources),
  );

  if (usage.status === 'loading') return <ChartSkeleton label="사용량 차트를 불러오는 중" />;
  if (usage.status === 'error') {
    return <p className={styles.empty}>사용량 데이터를 불러오지 못했습니다.</p>;
  }
  if (usage.data.length === 0) {
    return <p className={styles.empty}>실행 중인 리소스가 없어 표시할 사용량이 없습니다.</p>;
  }
  return (
    <>
      <p className={styles.chartSummary}>{describe(usage.data, resources.length)}</p>
      <MetricChart
        title="실행 중 리소스 평균 CPU·메모리 사용률(최근 24시간)"
        data={usage.data}
        series={SERIES}
        unit="%"
        showThresholds
      />
    </>
  );
}

export interface UsageTrendPanelProps {
  /** 실행 중인 리소스(데이터를 불러오는 중이면 null) */
  runningResources: Resource[] | null;
}

/** CPU·메모리 사용량: 실행 중 리소스 평균, 최근 24시간(설계서 3-2) */
export function UsageTrendPanel({ runningResources }: UsageTrendPanelProps) {
  return (
    <Panel
      title="CPU·메모리 사용량"
      description={
        runningResources
          ? `실행 중 리소스 ${String(runningResources.length)}대 평균 · 최근 24시간 · 30분 간격`
          : '최근 24시간'
      }
    >
      {runningResources ? (
        <UsageTrendChart resources={runningResources} />
      ) : (
        <ChartSkeleton label="사용량 차트를 불러오는 중" />
      )}
    </Panel>
  );
}
