import type { CostCategory } from '@/types/cost';

/** 비용 서비스 분류 표시명. 제공업체별 실제 서비스명은 constants/providers.ts의 services에 있다. */
export const COST_CATEGORY_LABEL: Record<CostCategory, string> = {
  compute: '컴퓨팅',
  storage: '스토리지',
  database: '데이터베이스',
  network: '네트워크',
  monitoring: '모니터링',
};

export const COST_CATEGORY_KEYS: CostCategory[] = [
  'compute',
  'storage',
  'database',
  'network',
  'monitoring',
];
