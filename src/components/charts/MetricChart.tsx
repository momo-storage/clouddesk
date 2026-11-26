import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';

import { USAGE_THRESHOLD } from '@/constants/thresholds';
import { formatDateTime, formatPercent, formatTime } from '@/utils/format';

import { ChartDataTable } from './ChartDataTable';
import { ChartLegend } from './ChartLegend';
import {
  ANIMATE,
  AXIS_TICK,
  BASELINE_STROKE,
  CHART_COLOR,
  CURSOR_STROKE,
  GRID_DASH,
  GRID_STROKE,
  LINE_WIDTH,
  TICK_MARGIN,
  type ChartSeries,
  type LegendItem,
} from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import styles from './Charts.module.scss';

export type MetricRow = { timestamp: string } & Record<string, number | string>;

export interface MetricChartProps {
  /** 대체 데이터 표 제목 */
  title: string;
  data: MetricRow[];
  series: ChartSeries[];
  unit: '%' | 'Mbps';
  /** 사용률 차트에 경고(70%)·위험(90%) 기준선을 그린다. */
  showThresholds?: boolean;
  height?: number;
}

/** 기준선은 범례에 점선 견본으로 함께 보여준다. */
const THRESHOLD_LEGEND: LegendItem[] = [
  {
    key: 'warning',
    label: `경고 ${String(USAGE_THRESHOLD.warning)}%`,
    color: CHART_COLOR.warning,
    dashed: true,
  },
  {
    key: 'critical',
    label: `위험 ${String(USAGE_THRESHOLD.critical)}%`,
    color: CHART_COLOR.critical,
    dashed: true,
  },
];

/**
 * 시계열 선 차트(대시보드 CPU·메모리, 리소스 상세·모니터링에서 재사용).
 * 그림은 낭독기에서 숨기고, 요약 문장 + 대체 데이터 표로 같은 정보를 제공한다(설계서 8-2).
 */
export function MetricChart({
  title,
  data,
  series,
  unit,
  showThresholds = false,
  height = 240,
}: MetricChartProps) {
  const formatValue = (value: number) =>
    unit === '%' ? `${formatPercent(value)}%` : `${formatPercent(value)} Mbps`;

  return (
    <div className={styles.chart}>
      <ChartLegend items={showThresholds ? [...series, ...THRESHOLD_LEGEND] : series} />
      <div className={styles.canvas} aria-hidden="true">
        <LineChart
          data={data}
          responsive
          style={{ width: '100%', height }}
          margin={{ top: 4, right: 4, bottom: 0, left: -4 }}
          accessibilityLayer={false}
        >
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray={GRID_DASH} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={AXIS_TICK}
            tickLine={false}
            tickMargin={TICK_MARGIN}
            axisLine={{ stroke: BASELINE_STROKE }}
            minTickGap={40}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            tickMargin={TICK_MARGIN}
            axisLine={false}
            width={unit === '%' ? 48 : 56}
            domain={unit === '%' ? [0, 100] : [0, 'auto']}
            ticks={unit === '%' ? [0, 25, 50, 75, 100] : undefined}
            unit={unit === '%' ? '%' : undefined}
          />
          {showThresholds &&
            THRESHOLD_LEGEND.map((item) => (
              <ReferenceLine
                key={item.key}
                y={item.key === 'warning' ? USAGE_THRESHOLD.warning : USAGE_THRESHOLD.critical}
                stroke={item.color}
                strokeDasharray="5 4"
                strokeWidth={1.5}
              />
            ))}
          <Tooltip
            cursor={{ stroke: CURSOR_STROKE }}
            isAnimationActive={ANIMATE}
            content={(props) => (
              <ChartTooltip {...props} formatLabel={formatDateTime} formatValue={formatValue} />
            )}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={LINE_WIDTH}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
              isAnimationActive={ANIMATE}
            />
          ))}
        </LineChart>
      </div>
      <ChartDataTable
        caption={title}
        columns={[
          { key: 'time', label: '시각' },
          ...series.map((item) => ({
            key: item.key,
            label: `${item.label} (${unit})`,
            align: 'end' as const,
          })),
        ]}
        rows={data.map((row) => ({
          time: formatDateTime(row.timestamp),
          ...Object.fromEntries(
            series.map((item) => [item.key, formatPercent(Number(row[item.key] ?? 0))]),
          ),
        }))}
      />
    </div>
  );
}
