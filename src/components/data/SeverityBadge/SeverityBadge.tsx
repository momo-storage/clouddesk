import { Badge } from '@/components/ui/Badge';
import { EVENT_SEVERITY_LABEL } from '@/constants/resourceStatus';
import type { EventSeverity } from '@/types/event';

import { SEVERITY_STYLE } from './severityStyle';

export interface SeverityBadgeProps {
  severity: EventSeverity;
}

/** 이벤트 심각도(정보·경고·위험). 아이콘 + 글자로 표시한다. */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { tone, icon } = SEVERITY_STYLE[severity];
  return (
    <Badge tone={tone} icon={icon}>
      {EVENT_SEVERITY_LABEL[severity]}
    </Badge>
  );
}
