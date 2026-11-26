import { generateMetricSeries } from '@/mocks/metrics';
import type { MetricName, MetricPeriod, MetricPoint, MetricSeries } from '@/types/metric';
import type { Resource } from '@/types/resource';

import { withDelay } from './delay';

/** 리소스 상세·모니터링 화면용 시계열 조회 */
export function getMetricSeries(
  resource: Resource,
  metric: MetricName,
  period: MetricPeriod,
): Promise<MetricSeries> {
  return withDelay(() => generateMetricSeries(resource, metric, period));
}

/**
 * 여러 리소스의 같은 지표를 시각별로 평균한다(대시보드 "실행 중 리소스 평균 CPU·메모리").
 * 대상이 없으면 빈 배열을 돌려준다.
 */
export function getAverageSeries(
  resources: Resource[],
  metric: MetricName,
  period: MetricPeriod,
): Promise<MetricPoint[]> {
  return withDelay(() => {
    const seriesList = resources.map(
      (resource) => generateMetricSeries(resource, metric, period).points,
    );
    const [first] = seriesList;
    if (!first) return [];
    return first.map((point, index) => {
      const sum = seriesList.reduce((total, series) => total + (series[index]?.value ?? 0), 0);
      return { timestamp: point.timestamp, value: Number((sum / seriesList.length).toFixed(1)) };
    });
  });
}
