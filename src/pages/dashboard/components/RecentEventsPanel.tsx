import { Link } from 'react-router';

import { SeverityBadge } from '@/components/data/SeverityBadge';
import { Panel } from '@/components/layout/Panel';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { PROVIDERS } from '@/constants/providers';
import { getRecentEvents } from '@/services/dashboard';
import type { CloudEvent } from '@/types/event';
import { formatDateTime } from '@/utils/format';

import styles from '../DashboardPage.module.scss';

import { TableSkeleton } from './TableSkeleton';

const LIMIT = 8;

export interface RecentEventsPanelProps {
  /** 데이터를 불러오는 중이면 null */
  events: CloudEvent[] | null;
  /** 현재 존재하는 리소스 ID(삭제된 리소스는 상세 링크를 만들지 않는다) */
  resourceIds: Set<string>;
}

/** 최근 알림 및 이벤트: 최신 8건, 심각도 아이콘 + 글자(설계서 3-2) */
export function RecentEventsPanel({ events, resourceIds }: RecentEventsPanelProps) {
  const recent = events ? getRecentEvents(events, LIMIT) : [];
  const unread = events ? events.filter((event) => !event.read).length : 0;

  return (
    <Panel
      title="최근 알림 및 이벤트"
      description={
        events
          ? `최신 ${String(recent.length)}건 · 읽지 않음 ${String(unread)}건`
          : `최신 ${String(LIMIT)}건`
      }
      flush
    >
      {!events ? (
        <TableSkeleton label="최근 이벤트를 불러오는 중" rows={LIMIT} />
      ) : recent.length === 0 ? (
        <p className={styles.empty}>최근 이벤트가 없습니다.</p>
      ) : (
        <Table
          caption="최근 알림 및 이벤트"
          hideCaption
          minWidth={560}
          className={styles.flushTable}
        >
          <thead>
            <tr>
              <TableHeaderCell>발생 시각</TableHeaderCell>
              <TableHeaderCell>심각도</TableHeaderCell>
              <TableHeaderCell>리소스</TableHeaderCell>
              <TableHeaderCell>내용</TableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {recent.map((event) => (
              <TableRow key={event.id}>
                <TableCell className={styles.nowrap}>
                  <time dateTime={event.occurredAt}>{formatDateTime(event.occurredAt)}</time>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={event.severity} />
                </TableCell>
                <TableCell className={styles.nowrap}>
                  {resourceIds.has(event.resourceId) ? (
                    <Link to={`/resources/${event.resourceId}`}>{event.resourceName}</Link>
                  ) : (
                    <>
                      {event.resourceName} <span className={styles.muted}>(삭제됨)</span>
                    </>
                  )}
                  <span className={styles.subText}>{PROVIDERS[event.provider].label}</span>
                </TableCell>
                <TableCell>{event.message}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}
