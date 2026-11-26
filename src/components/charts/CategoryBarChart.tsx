import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartDataTable } from './ChartDataTable';
import { ChartLegend } from './ChartLegend';
import {
  ANIMATE,
  AXIS_TICK,
  BASELINE_STROKE,
  GRID_DASH,
  GRID_STROKE,
  TICK_MARGIN,
  type ChartSeries,
} from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import styles from './Charts.module.scss';

export type CategoryRow = Record<string, number | string>;

/**
 * 읽기 쉬운 축 눈금(0과 1·2·2.5·5·10 단위 간격, 5칸 내외).
 * 예) 최댓값 34 → 0, 10, 20, 30, 40 / 10,857 → 0, 2,500, … 12,500
 */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const step =
    (normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 2.5
          ? 2.5
          : normalized <= 5
            ? 5
            : 10) * magnitude;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

export interface CategoryBarChartProps {
  /** 대체 데이터 표 제목 */
  title: string;
  data: CategoryRow[];
  /** 항목(가로축 또는 세로축) 값이 들어 있는 키 */
  categoryKey: string;
  /** 대체 데이터 표의 첫 열 이름(예: "제공업체", "월") */
  categoryLabel: string;
  series: ChartSeries[];
  /** horizontal: 가로 막대(항목이 세로로 나열) / vertical: 세로 막대(항목이 가로로 나열) */
  orientation?: 'horizontal' | 'vertical';
  /** 항목 값 표시(예: "2026-11" → "11월") */
  formatCategory?: (category: string) => string;
  /** Tooltip·대체 데이터 표의 값 표시 */
  formatValue: (value: number) => string;
  /** 축 눈금 표시(생략하면 formatValue) */
  formatAxis?: (value: number) => string;
  /** 대체 데이터 표 값 열의 단위 표기(예: "대", "USD") */
  unitLabel: string;
  height?: number;
}

/**
 * 항목별 누적 막대 차트(대시보드 제공업체별 현황·월별 비용, 비용 관리에서 재사용).
 * 누적 막대의 합계는 Tooltip과 대체 데이터 표에 함께 보여준다.
 */
export function CategoryBarChart({
  title,
  data,
  categoryKey,
  categoryLabel,
  series,
  orientation = 'vertical',
  formatCategory = (category) => category,
  formatValue,
  formatAxis = formatValue,
  unitLabel,
  height = 240,
}: CategoryBarChartProps) {
  const horizontal = orientation === 'horizontal';
  const categoryAxis = {
    dataKey: categoryKey,
    tickFormatter: (value: string) => formatCategory(value),
    tick: AXIS_TICK,
    tickLine: false,
    tickMargin: TICK_MARGIN,
    axisLine: { stroke: BASELINE_STROKE },
  };
  const stackedMax = Math.max(
    0,
    ...data.map((row) => series.reduce((sum, item) => sum + Number(row[item.key] ?? 0), 0)),
  );
  const ticks = niceTicks(stackedMax);
  const valueAxis = {
    tick: AXIS_TICK,
    tickLine: false,
    tickMargin: TICK_MARGIN,
    axisLine: false,
    tickFormatter: (value: number) => formatAxis(value),
    ticks,
    domain: [0, ticks.at(-1) ?? 1] as [number, number],
  };

  return (
    <div className={styles.chart}>
      <ChartLegend items={series} />
      <div className={styles.canvas} aria-hidden="true">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          responsive
          style={{ width: '100%', height }}
          margin={{ top: 4, right: 4, bottom: 0, left: -4 }}
          barCategoryGap={horizontal ? '28%' : '30%'}
          accessibilityLayer={false}
        >
          <CartesianGrid
            horizontal={!horizontal}
            vertical={horizontal}
            stroke={GRID_STROKE}
            strokeDasharray={GRID_DASH}
          />
          {horizontal ? (
            <>
              <XAxis type="number" {...valueAxis} />
              <YAxis type="category" width={56} {...categoryAxis} />
            </>
          ) : (
            <>
              <XAxis type="category" {...categoryAxis} />
              <YAxis type="number" width={56} {...valueAxis} />
            </>
          )}
          <Tooltip
            cursor={{ fill: 'var(--color-surface-hover)' }}
            isAnimationActive={ANIMATE}
            content={(props) => (
              <ChartTooltip
                {...props}
                formatLabel={formatCategory}
                formatValue={formatValue}
                showTotal={series.length > 1}
              />
            )}
          />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              stackId="total"
              fill={item.color}
              // 누적 막대 사이를 흰 선으로 나눠 색이 비슷해도 구간이 구분되게 한다.
              stroke="var(--color-surface)"
              strokeWidth={1}
              maxBarSize={horizontal ? 22 : 36}
              isAnimationActive={ANIMATE}
            />
          ))}
        </BarChart>
      </div>
      <ChartDataTable
        caption={title}
        columns={[
          { key: 'category', label: categoryLabel },
          ...series.map((item) => ({
            key: item.key,
            label: `${item.label} (${unitLabel})`,
            align: 'end' as const,
          })),
          { key: 'total', label: `합계 (${unitLabel})`, align: 'end' as const },
        ]}
        rows={data.map((row) => ({
          category: formatCategory(String(row[categoryKey])),
          ...Object.fromEntries(
            series.map((item) => [item.key, formatValue(Number(row[item.key] ?? 0))]),
          ),
          total: formatValue(series.reduce((sum, item) => sum + Number(row[item.key] ?? 0), 0)),
        }))}
      />
    </div>
  );
}
