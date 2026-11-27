import { SeverityBadge } from '@/components/data/SeverityBadge';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import type { CloudEvent } from '@/types/event';
import { formatDateTime } from '@/utils/format';

import styles from '../ResourceDetailPage.module.scss';

export interface ResourceEventTableProps {
  caption: string;
  /** 최신순으로 정렬된 이벤트 */
  events: CloudEvent[];
}

/** 리소스 한 대의 이벤트 표(개요의 최근 이벤트, 이벤트 로그 탭). 발생 시각 · 심각도 · 내용 */
export function ResourceEventTable({ caption, events }: ResourceEventTableProps) {
  return (
    <Table caption={caption} hideCaption minWidth={560} className={styles.flushTable}>
      <thead>
        <tr>
          <TableHeaderCell className={styles.colTime}>발생 시각</TableHeaderCell>
          <TableHeaderCell className={styles.colSeverity}>심각도</TableHeaderCell>
          <TableHeaderCell>내용</TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className={styles.nowrap}>
              <time dateTime={event.occurredAt} className={styles.tabular}>
                {formatDateTime(event.occurredAt)}
              </time>
            </TableCell>
            <TableCell>
              <SeverityBadge severity={event.severity} />
            </TableCell>
            <TableCell>{event.message}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
