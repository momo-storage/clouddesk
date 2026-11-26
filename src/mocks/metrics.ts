import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import type { MetricName, MetricPeriod, MetricPoint, MetricSeries } from '@/types/metric';
import type { Resource } from '@/types/resource';

import { getTier } from './network';
import { createRandom, hashString } from './random';

/**
 * 리소스별 모니터링 시계열. 저장하지 않고 리소스 ID를 시드로 매번 같은 값을 계산한다(설계서 3-1).
 * - 마지막 값은 리소스의 현재 사용률과 같다(목록·상세·차트의 숫자가 일치).
 * - 24시간·7일은 업무 시간(오후 2시 전후)에 높아지는 하루 주기를 둔다.
 * - 중지·오류 상태는 CPU·메모리·네트워크가 0이다. 디스크 사용률은 상태와 무관하게 서서히 늘어난다.
 */
export const PERIOD_CONFIG: Record<MetricPeriod, { points: number; stepMinutes: number }> = {
  '1h': { points: 12, stepMinutes: 5 },
  '24h': { points: 48, stepMinutes: 30 },
  '7d': { points: 84, stepMinutes: 120 },
};

const DISK_GROWTH: Record<MetricPeriod, number> = { '1h': 0, '24h': 0.4, '7d': 2.5 };

/** 계층별 평상시 네트워크 수신량(Mbps). 송신은 수신의 60% 수준 */
const NETWORK_BASE = { web: 85, app: 35, data: 25, mgmt: 4 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** KST 시각(0~23.x)에 따른 하루 주기. 오후 2시에 1, 새벽 2시에 -1 */
function dailyWave(time: number): number {
  const kstHour = (((time / 3_600_000 + 9) % 24) + 24) % 24;
  return Math.cos(((kstHour - 14) / 24) * 2 * Math.PI);
}

export function generateMetricSeries(
  resource: Resource,
  metric: MetricName,
  period: MetricPeriod,
): MetricSeries {
  const { points: count, stepMinutes } = PERIOD_CONFIG[period];
  const random = createRandom(hashString(`${resource.id}:${metric}:${period}`));
  const end = new Date(DEMO_REFERENCE_TIME).getTime();
  const times = Array.from(
    { length: count },
    (_, index) => end - (count - 1 - index) * stepMinutes * 60_000,
  );
  const inactive = resource.status === 'stopped' || resource.status === 'error';
  const waveAmount = period === '1h' ? 0 : 1;

  const values = times.map((time, index) => {
    const isLast = index === count - 1;
    switch (metric) {
      case 'cpu':
      case 'memory': {
        const current = metric === 'cpu' ? resource.cpuUsage : resource.memoryUsage;
        if (inactive || isLast) return current;
        // 메모리는 CPU보다 변동이 작다.
        const swing = metric === 'cpu' ? 0.28 : 0.08;
        const wave = waveAmount * swing * current * (dailyWave(time) - dailyWave(end));
        const noise = random.float(-1, 1, 3) * (metric === 'cpu' ? 6 : 2);
        return clamp(current + wave + noise, 0, 100);
      }
      case 'disk': {
        const progress = index / (count - 1);
        const value = resource.diskUsage - DISK_GROWTH[period] * (1 - progress);
        return isLast ? resource.diskUsage : clamp(value + random.float(-0.1, 0.1, 3), 0, 100);
      }
      case 'networkIn':
      case 'networkOut': {
        if (inactive) return 0;
        const base = NETWORK_BASE[getTier(resource.name)] * (metric === 'networkOut' ? 0.6 : 1);
        const load = resource.status === 'pending' ? 0.1 : 0.5 + resource.cpuUsage / 200;
        const wave = 1 + waveAmount * 0.35 * dailyWave(time);
        return Math.max(0, base * load * wave * random.float(0.85, 1.15, 3));
      }
    }
  });

  const points: MetricPoint[] = times.map((time, index) => ({
    timestamp: new Date(time).toISOString(),
    value: Number((values[index] ?? 0).toFixed(1)),
  }));

  return {
    resourceId: resource.id,
    metric,
    period,
    unit: metric === 'networkIn' || metric === 'networkOut' ? 'Mbps' : '%',
    points,
  };
}
