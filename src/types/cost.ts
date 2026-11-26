import type { CloudProvider } from './resource';

/** 서비스 분류. 제공업체마다 실제 서비스 이름은 다르므로 표시명은 constants/costs.ts에서 정한다. */
export type CostCategory = 'compute' | 'storage' | 'database' | 'network' | 'monitoring';

/** 월·제공업체·서비스별 청구 금액(USD) */
export interface CostRecord {
  /** YYYY-MM */
  month: string;
  provider: CloudProvider;
  category: CostCategory;
  /** 제공업체의 실제 서비스명(예: Amazon EC2, Virtual Machines, Compute Engine) */
  service: string;
  amount: number;
}
