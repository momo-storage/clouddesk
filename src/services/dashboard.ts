import { PROVIDER_KEYS } from '@/constants/providers';
import { RESOURCE_STATUS_KEYS } from '@/constants/resourceStatus';
import type { CostRecord } from '@/types/cost';
import type { CloudEvent } from '@/types/event';
import type { CloudProvider, Resource, ResourceStatus } from '@/types/resource';

/**
 * 대시보드·비용 화면에서 쓰는 집계 함수. 상태(Context)의 데이터를 받아 계산만 하는 순수 함수다.
 * 리소스를 등록·삭제하면 같은 함수로 다시 계산되므로 화면 간 숫자가 어긋나지 않는다.
 */

export type StatusCounts = Record<ResourceStatus, number>;

export interface ResourceSummary {
  total: number;
  byStatus: StatusCounts;
  byProvider: Record<CloudProvider, StatusCounts & { total: number }>;
}

function emptyCounts(): StatusCounts {
  return Object.fromEntries(RESOURCE_STATUS_KEYS.map((status) => [status, 0])) as StatusCounts;
}

export function summarizeResources(resources: Resource[]): ResourceSummary {
  const byStatus = emptyCounts();
  const byProvider = Object.fromEntries(
    PROVIDER_KEYS.map((provider) => [provider, { ...emptyCounts(), total: 0 }]),
  ) as ResourceSummary['byProvider'];

  for (const resource of resources) {
    byStatus[resource.status] += 1;
    byProvider[resource.provider][resource.status] += 1;
    byProvider[resource.provider].total += 1;
  }
  return { total: resources.length, byStatus, byProvider };
}

/** CPU 사용률 상위 리소스(주요 리소스 상태) */
export function getTopCpuResources(resources: Resource[], limit = 5): Resource[] {
  return [...resources].sort((a, b) => b.cpuUsage - a.cpuUsage).slice(0, limit);
}

/** 최신 이벤트(이벤트는 상태에서 최신순으로 유지된다) */
export function getRecentEvents(events: CloudEvent[], limit = 8): CloudEvent[] {
  return events.slice(0, limit);
}

export interface MonthlyCostSummary {
  month: string;
  total: number;
  previousMonth: string | null;
  previousTotal: number | null;
  /** 전월 대비 증감률(%). 전월 데이터가 없으면 null */
  changeRate: number | null;
}

function sum(records: CostRecord[]): number {
  return Math.round(records.reduce((total, record) => total + record.amount, 0) * 100) / 100;
}

/** 가장 최근 달의 총비용과 전월 대비 증감 */
export function getMonthlyCostSummary(records: CostRecord[]): MonthlyCostSummary | null {
  const months = [...new Set(records.map((record) => record.month))].sort();
  const month = months.at(-1);
  if (!month) return null;
  const previousMonth = months.at(-2) ?? null;
  const total = sum(records.filter((record) => record.month === month));
  const previousTotal = previousMonth
    ? sum(records.filter((record) => record.month === previousMonth))
    : null;
  return {
    month,
    total,
    previousMonth,
    previousTotal,
    changeRate:
      previousTotal && previousTotal > 0
        ? Math.round(((total - previousTotal) / previousTotal) * 1000) / 10
        : null,
  };
}

export type MonthlyProviderCost = { month: string } & Record<CloudProvider, number>;

/** 월별·제공업체별 비용(월별 비용 추이 차트). 최근 limit개월만 돌려준다. */
export function getMonthlyCostByProvider(
  records: CostRecord[],
  limit?: number,
): MonthlyProviderCost[] {
  const months = [...new Set(records.map((record) => record.month))].sort();
  const selected = limit ? months.slice(-limit) : months;
  return selected.map((month) => {
    const row = { month, aws: 0, azure: 0, gcp: 0 };
    for (const record of records) {
      if (record.month === month) row[record.provider] += record.amount;
    }
    for (const provider of PROVIDER_KEYS) row[provider] = Math.round(row[provider] * 100) / 100;
    return row;
  });
}
