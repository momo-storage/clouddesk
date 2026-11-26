/** 사용률 지표(%)와 네트워크 트래픽(Mbps) */
export type MetricName = 'cpu' | 'memory' | 'disk' | 'networkIn' | 'networkOut';

/** 조회 기간: 최근 1시간(5분 간격) / 24시간(30분 간격) / 7일(2시간 간격) */
export type MetricPeriod = '1h' | '24h' | '7d';

export interface MetricPoint {
  /** ISO 8601 */
  timestamp: string;
  value: number;
}

export interface MetricSeries {
  resourceId: string;
  metric: MetricName;
  period: MetricPeriod;
  unit: '%' | 'Mbps';
  points: MetricPoint[];
}

/** 정상 < 70% ≤ 경고 < 90% ≤ 위험 */
export type ThresholdLevel = 'normal' | 'warning' | 'critical';
