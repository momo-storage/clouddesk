import { getSecurityRules as computeSecurityRules } from '@/mocks/network';
import type { Resource, SecurityRule } from '@/types/resource';

import { withDelay } from './delay';

/** 리소스 상세 네트워크 탭의 인바운드 보안 규칙(저장하지 않고 리소스 이름·제공업체로 계산한다) */
export function getSecurityRules(resource: Resource): Promise<SecurityRule[]> {
  return withDelay(() => computeSecurityRules(resource));
}
