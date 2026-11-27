import { useState } from 'react';

import {
  CategoryBarChart,
  CHART_COLOR,
  ChartDataTable,
  ChartSkeleton,
  MetricChart,
  type MetricRow,
} from '@/components/charts';
import { RadioGroup } from '@/components/ui/Radio';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { RESOURCE_STATUS_LABEL } from '@/constants/resourceStatus';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { summarizeResources } from '@/services/dashboard';
import { getMetricSeries } from '@/services/metricService';
import { useDemoData } from '@/store/demoData/demoDataContext';
import type { MetricPeriod } from '@/types/metric';
import type { Resource } from '@/types/resource';
import { formatMonthDay, formatNumber, formatTime } from '@/utils/format';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';

const USAGE_SERIES = [
  { key: 'cpu', label: 'CPU', color: CHART_COLOR.cpu },
  { key: 'memory', label: '메모리', color: CHART_COLOR.memory },
];

const PERIOD_OPTIONS: { value: MetricPeriod; label: string }[] = [
  { value: '1h', label: '1시간' },
  { value: '24h', label: '24시간' },
  { value: '7d', label: '7일' },
];

async function loadUsage(resource: Resource, period: MetricPeriod): Promise<MetricRow[]> {
  const [cpu, memory] = await Promise.all([
    getMetricSeries(resource, 'cpu', period),
    getMetricSeries(resource, 'memory', period),
  ]);
  return cpu.points.map((point, index) => ({
    timestamp: point.timestamp,
    cpu: point.value,
    memory: memory.points[index]?.value ?? 0,
  }));
}

function UsageChartExample({ resource, period }: { resource: Resource; period: MetricPeriod }) {
  const usage = useAsyncValue(`${resource.id}:${period}`, () => loadUsage(resource, period));
  if (usage.status !== 'ready') return <ChartSkeleton label="예시 차트를 불러오는 중" />;
  return (
    <MetricChart
      title={`${resource.name} CPU·메모리 사용률(예시)`}
      data={usage.data}
      series={USAGE_SERIES}
      unit="%"
      showThresholds
      height={220}
      formatTick={period === '7d' ? formatMonthDay : formatTime}
    />
  );
}

/** 실제 데모 데이터에서 CPU가 가장 높은 실행 중 리소스를 예시로 쓴다(기준선이 함께 보이도록). */
function useSampleResource(): Resource | null {
  const { state } = useDemoData();
  const running = state.resources.filter((resource) => resource.status === 'running');
  return running.reduce<Resource | null>(
    (top, resource) => (!top || resource.cpuUsage > top.cpuUsage ? resource : top),
    null,
  );
}

export function MetricChartDemo() {
  const resource = useSampleResource();
  const [period, setPeriod] = useState<MetricPeriod>('24h');

  return (
    <GuideSection id="metric-chart" title="MetricChart">
      <GuideExample label="사용률(%) · 경고·위험 기준선 · 조회 기간(7일은 날짜 축)" wide>
        <div className={styles.stack}>
          <RadioGroup
            legend="예시 조회 기간"
            orientation="horizontal"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
          <div className={styles.fullWidth}>
            {resource ? (
              <UsageChartExample resource={resource} period={period} />
            ) : (
              <ChartSkeleton label="예시 차트를 불러오는 중" />
            )}
          </div>
        </div>
      </GuideExample>
    </GuideSection>
  );
}

const STATUS_SERIES = [
  { key: 'running', label: RESOURCE_STATUS_LABEL.running, color: CHART_COLOR.running },
  { key: 'pending', label: RESOURCE_STATUS_LABEL.pending, color: CHART_COLOR.pending },
  { key: 'error', label: RESOURCE_STATUS_LABEL.error, color: CHART_COLOR.error },
  { key: 'stopped', label: RESOURCE_STATUS_LABEL.stopped, color: CHART_COLOR.stopped },
];

export function CategoryBarChartDemo() {
  const { state } = useDemoData();
  const summary = state.status === 'ready' ? summarizeResources(state.resources) : null;
  const rows = summary
    ? PROVIDER_KEYS.map((provider) => ({
        provider: PROVIDERS[provider].label,
        ...summary.byProvider[provider],
      }))
    : [];

  return (
    <GuideSection id="category-bar-chart" title="CategoryBarChart">
      {(['horizontal', 'vertical'] as const).map((orientation) => (
        <GuideExample
          key={orientation}
          label={orientation === 'horizontal' ? '가로 누적 막대' : '세로 누적 막대'}
        >
          <div className={styles.fullWidth}>
            {summary ? (
              <CategoryBarChart
                title={`제공업체별 상태별 리소스 수(${orientation === 'horizontal' ? '가로' : '세로'} 예시)`}
                data={rows}
                categoryKey="provider"
                categoryLabel="제공업체"
                series={STATUS_SERIES}
                orientation={orientation}
                formatValue={formatNumber}
                unitLabel="대"
                height={220}
              />
            ) : (
              <ChartSkeleton label="예시 차트를 불러오는 중" height={220} />
            )}
          </div>
        </GuideExample>
      ))}
    </GuideSection>
  );
}

export function ChartPartsDemo() {
  return (
    <GuideSection id="chart-parts" title="차트 공통 요소">
      <GuideExample label="ChartLegend · ChartTooltip">
        <p className={styles.mutedText}>
          범례는 차트 위 왼쪽에 색 견본과 이름으로, 기준선은 점선 견본으로 표시합니다. 툴팁은 차트
          위에 마우스를 올리면 시각·값과 합계를 보여줍니다. 위 MetricChart·CategoryBarChart 예시에서
          확인할 수 있습니다.
        </p>
      </GuideExample>
      <GuideExample label="ChartDataTable: 차트와 같은 값을 펼쳐 보는 표">
        <div className={styles.fullWidth}>
          <ChartDataTable
            caption="월별 비용(예시)"
            columns={[
              { key: 'month', label: '월' },
              { key: 'cost', label: '비용 (USD)', align: 'end' },
            ]}
            rows={[
              { month: '2026년 9월', cost: '$9,812.40' },
              { month: '2026년 10월', cost: '$10,420.05' },
              { month: '2026년 11월', cost: '$10,857.17' },
            ]}
          />
        </div>
      </GuideExample>
      <GuideExample label="ChartSkeleton: 차트 데이터를 불러오는 동안">
        <div className={styles.fullWidth}>
          <ChartSkeleton label="예시 차트를 불러오는 중" height={120} />
        </div>
      </GuideExample>
    </GuideSection>
  );
}
