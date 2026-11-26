import { Bell, CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDERS } from '@/constants/providers';
import { EVENT_SEVERITY_LABEL } from '@/constants/resourceStatus';
import { useDemoData } from '@/store/demoData/demoDataContext';
import { useToast } from '@/store/toast/toastContext';
import type { EventSeverity } from '@/types/event';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/format';

import styles from './NotificationMenu.module.scss';

const RECENT_LIMIT = 5;

const SEVERITY_ICON: Record<EventSeverity, LucideIcon> = {
  critical: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export interface NotificationMenuProps {
  /** 헤더의 아이콘 버튼 모양 */
  triggerClassName?: string;
}

/**
 * 헤더 알림: 읽지 않은 개수와 최근 이벤트 5건, "모두 읽음".
 * 이벤트 데이터는 대시보드·리소스 상세와 같은 상태를 쓴다(리소스 등록·수정·삭제 시 바로 추가된다).
 */
export function NotificationMenu({ triggerClassName }: NotificationMenuProps) {
  const { state, actions } = useDemoData();
  const { showToast } = useToast();
  const [marking, setMarking] = useState(false);

  const unreadCount = state.events.filter((event) => !event.read).length;
  const recentEvents = state.events.slice(0, RECENT_LIMIT);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await actions.markAllEventsRead();
      showToast('알림을 모두 읽음으로 표시했습니다.', 'info');
    } catch {
      showToast('알림 상태를 바꾸지 못했습니다. 잠시 후 다시 시도하세요.', 'error');
    } finally {
      setMarking(false);
    }
  };

  return (
    <Dropdown
      align="end"
      triggerClassName={triggerClassName}
      trigger={
        <>
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className={styles.count} aria-hidden="true">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <VisuallyHidden>
            {unreadCount > 0 ? `알림, 읽지 않은 알림 ${String(unreadCount)}건` : '알림'}
          </VisuallyHidden>
        </>
      }
    >
      {() => (
        <div className={styles.panel}>
          <div className={styles.header}>
            <p className={styles.title}>알림</p>
            {/* 읽을 알림이 없어도 버튼을 없애지 않는다(누른 버튼이 사라지면 초점을 잃는다). */}
            <Button
              size="sm"
              variant="ghost"
              loading={marking}
              aria-disabled={unreadCount === 0 || undefined}
              onClick={() => {
                void markAllRead();
              }}
            >
              모두 읽음
            </Button>
          </div>

          {state.status === 'loading' ? (
            <p className={styles.message}>알림을 불러오는 중입니다.</p>
          ) : recentEvents.length === 0 ? (
            <p className={styles.message}>새 알림이 없습니다.</p>
          ) : (
            <>
              <ul className={styles.list}>
                {recentEvents.map((event) => {
                  const Icon = SEVERITY_ICON[event.severity];
                  return (
                    <li key={event.id} className={cn(styles.item, !event.read && styles.unread)}>
                      <Icon
                        size={16}
                        className={cn(styles.icon, styles[event.severity])}
                        aria-hidden="true"
                      />
                      <div className={styles.body}>
                        <p className={styles.text}>
                          <VisuallyHidden>
                            {event.read ? '' : '읽지 않음, '}
                            {EVENT_SEVERITY_LABEL[event.severity]}:{' '}
                          </VisuallyHidden>
                          {event.message}
                        </p>
                        <p className={styles.meta}>
                          {event.resourceName} · {PROVIDERS[event.provider].label} ·{' '}
                          <time dateTime={event.occurredAt}>
                            {formatDateTime(event.occurredAt)}
                          </time>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.footer}>
                전체 {state.events.length}건 중 최근 {recentEvents.length}건
              </p>
            </>
          )}
        </div>
      )}
    </Dropdown>
  );
}
