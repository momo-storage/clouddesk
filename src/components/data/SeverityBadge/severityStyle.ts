import { CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

import type { BadgeTone } from '@/components/ui/Badge';
import type { EventSeverity } from '@/types/event';

/** 이벤트 심각도별 아이콘·색. 헤더 알림과 이벤트 목록이 같은 표시를 쓴다. */
export const SEVERITY_STYLE: Record<EventSeverity, { tone: BadgeTone; icon: LucideIcon }> = {
  info: { tone: 'info', icon: Info },
  warning: { tone: 'warning', icon: TriangleAlert },
  critical: { tone: 'danger', icon: CircleAlert },
};
