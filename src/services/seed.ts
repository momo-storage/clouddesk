import { createSeedCosts } from '@/mocks/costs';
import { createSeedEvents } from '@/mocks/events';
import { createSeedResources } from '@/mocks/resources';
import { createSeedUsers } from '@/mocks/users';
import type { CostRecord } from '@/types/cost';

import type { DemoDataSnapshot } from './storage';

/** 시드 데이터 묶음. 같은 함수를 여러 번 불러도 항상 같은 값이 나온다. */
export function createSeedSnapshot(): DemoDataSnapshot {
  const resources = createSeedResources();
  return {
    resources,
    events: createSeedEvents(resources),
    users: createSeedUsers(),
  };
}

/** 청구 데이터는 시드 리소스 구성으로 한 번 계산해 둔다(리소스를 바꿔도 지난 청구 금액은 그대로). */
let seedCosts: CostRecord[] | null = null;

export function getSeedCosts(): CostRecord[] {
  seedCosts ??= createSeedCosts(createSeedResources());
  return seedCosts;
}
