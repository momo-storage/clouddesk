import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import { findInstanceType, PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import type { CostCategory, CostRecord } from '@/types/cost';
import type { CloudProvider, Resource } from '@/types/resource';

import { createRandom } from './random';

/**
 * 최근 12개월 청구 데이터(USD). 시드 리소스에서 계산해 리소스 구성과 비용이 맞도록 한다.
 * - 컴퓨팅: 과금 대상 인스턴스(중지 제외)의 시간당 요금 × 730시간
 * - 스토리지: 디스크 용량 × GB당 월 요금(중지된 인스턴스도 과금)
 * - DB·네트워크·모니터링: 제공업체별 관리형 서비스 기본료와 컴퓨팅 대비 비율
 * 과거 달은 리소스가 점차 늘어난 것으로 보고 비용을 줄여 계산한다(약 18% 성장).
 *
 * 청구 데이터는 확정된 기록이므로 리소스를 등록·삭제해도 바뀌지 않는다.
 */
const MONTHS = 12;
const HOURS_PER_MONTH = 730;
const STORAGE_USD_PER_GB = 0.1;
const DATABASE_BASE_USD: Record<CloudProvider, number> = { aws: 1480, azure: 960, gcp: 610 };
const NETWORK_RATIO = 0.09;
const MONITORING_RATIO = 0.035;

/** 기준 월(2026-11)부터 거슬러 올라간 YYYY-MM 목록(오래된 순) */
export function getCostMonths(): string[] {
  const reference = new Date(DEMO_REFERENCE_TIME);
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  return Array.from({ length: MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(year, month - (MONTHS - 1 - index), 1));
    return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function createSeedCosts(resources: Resource[]): CostRecord[] {
  const random = createRandom(730);
  const months = getCostMonths();

  return months.flatMap((month, monthIndex) => {
    // 첫 달 0.82 → 마지막 달 1.0으로 늘어나는 리소스 규모
    const growth = 0.82 + (0.18 * monthIndex) / (MONTHS - 1);

    return PROVIDER_KEYS.flatMap((provider) => {
      const providerResources = resources.filter((resource) => resource.provider === provider);
      const compute = providerResources
        .filter((resource) => resource.status !== 'stopped')
        .reduce(
          (sum, resource) =>
            sum +
            (findInstanceType(provider, resource.instanceType)?.hourlyUsd ?? 0) * HOURS_PER_MONTH,
          0,
        );
      const storage = providerResources.reduce(
        (sum, resource) => sum + resource.diskSizeGb * STORAGE_USD_PER_GB,
        0,
      );
      const base: Record<CostCategory, number> = {
        compute,
        storage,
        database: DATABASE_BASE_USD[provider],
        network: compute * NETWORK_RATIO,
        monitoring: compute * MONITORING_RATIO,
      };

      return (Object.keys(base) as CostCategory[]).map((category) => ({
        month,
        provider,
        category,
        service: PROVIDERS[provider].services[category],
        // 달마다 사용량 차이(±4%)를 둔다.
        amount: round(base[category] * growth * random.float(0.96, 1.04, 3)),
      }));
    });
  });
}
