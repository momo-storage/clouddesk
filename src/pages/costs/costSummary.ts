import type { CostRecord } from '@/types/cost';

/** 조회 기간: 최근 3·6·12개월(Mock 비용 데이터는 12개월) */
export type CostPeriod = 3 | 6 | 12;

export const COST_PERIODS: CostPeriod[] = [3, 6, 12];

/** 소수점 둘째 자리까지(센트) 합계 */
export function sumAmount(records: CostRecord[]): number {
  return Math.round(records.reduce((total, record) => total + record.amount, 0) * 100) / 100;
}

/** 기록에 있는 달(YYYY-MM)을 오래된 순으로 */
export function getMonths(records: CostRecord[]): string[] {
  return [...new Set(records.map((record) => record.month))].sort();
}

/** 전월 대비 증감률(%). 전월 금액이 없으면 null */
export function changeRate(current: number, previous: number): number | null {
  return previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;
}

export interface CostBreakdownRow {
  key: string;
  /** 선택한 기간 합계 */
  periodTotal: number;
  /** 기간 합계 중 비중(%) */
  share: number;
  /** 이번 달(가장 최근 달) 금액 */
  current: number;
  /** 이번 달 전월 대비 증감률(%) */
  change: number | null;
}

/**
 * 기간 기록을 key별로 묶어 기간 합계·비중·이번 달·전월 대비를 계산한다(제공업체별, 서비스 유형별 표).
 * records는 이미 기간으로 거른 기록, months는 그 기간의 달 목록이다.
 */
export function getBreakdown(
  records: CostRecord[],
  months: string[],
  keys: string[],
  keyOf: (record: CostRecord) => string,
): CostBreakdownRow[] {
  const total = sumAmount(records);
  const currentMonth = months.at(-1);
  const previousMonth = months.at(-2);
  return keys
    .map((key) => {
      const own = records.filter((record) => keyOf(record) === key);
      const periodTotal = sumAmount(own);
      const current = sumAmount(own.filter((record) => record.month === currentMonth));
      const previous = sumAmount(own.filter((record) => record.month === previousMonth));
      return {
        key,
        periodTotal,
        share: total > 0 ? Math.round((periodTotal / total) * 1000) / 10 : 0,
        current,
        change: previousMonth ? changeRate(current, previous) : null,
      };
    })
    .sort((a, b) => b.periodTotal - a.periodTotal);
}
