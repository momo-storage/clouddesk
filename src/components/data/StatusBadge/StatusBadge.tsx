import { CircleAlert, CircleCheck, CircleStop, LoaderCircle, type LucideIcon } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { RESOURCE_STATUS_LABEL } from '@/constants/resourceStatus';
import type { ResourceStatus } from '@/types/resource';

const STATUS_STYLE: Record<ResourceStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  running: { tone: 'success', icon: CircleCheck },
  stopped: { tone: 'neutral', icon: CircleStop },
  pending: { tone: 'warning', icon: LoaderCircle },
  error: { tone: 'danger', icon: CircleAlert },
};

export interface StatusBadgeProps {
  status: ResourceStatus;
}

/** 리소스 상태 표시. 아이콘 + 글자로 표시해 색에만 의존하지 않는다(설계서 6-3). */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { tone, icon } = STATUS_STYLE[status];
  return (
    <Badge tone={tone} icon={icon}>
      {RESOURCE_STATUS_LABEL[status]}
    </Badge>
  );
}
