import type { CostRecord } from '@/types/cost';

import { withDelay } from './delay';
import { getSeedCosts } from './seed';

/** 비용 청구 기록 조회. 기간 필터를 주면 그 범위(YYYY-MM, 양 끝 포함)만 돌려준다. */
export function getCostRecords(range?: { from: string; to: string }): Promise<CostRecord[]> {
  return withDelay(() => {
    const records = getSeedCosts();
    if (!range) return records;
    return records.filter((record) => record.month >= range.from && record.month <= range.to);
  });
}
