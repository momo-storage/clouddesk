import type { ReactNode } from 'react';

import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { formatPercent, formatUsd } from '@/utils/format';

import type { CostBreakdownRow } from '../costSummary';
import styles from '../CostsPage.module.scss';

export interface CostBreakdownTableProps {
  caption: string;
  /** 첫 열 이름(예: "제공업체", "서비스 유형") */
  keyLabel: string;
  rows: CostBreakdownRow[];
  /** 첫 열 내용(이름, 배지 등) */
  renderKey: (key: string) => ReactNode;
  /** 비중 막대 색(제공업체 색 등). 없으면 기본 강조색 */
  barColor?: (key: string) => string;
  periodLabel: string;
}

/** 비용 내역 표: 기간 합계 · 비중 · 이번 달 · 전월 대비(제공업체별, 서비스 유형별이 함께 쓴다). */
export function CostBreakdownTable({
  caption,
  keyLabel,
  rows,
  renderKey,
  barColor,
  periodLabel,
}: CostBreakdownTableProps) {
  return (
    <Table caption={caption} hideCaption minWidth={600} className={styles.flushTable}>
      <thead>
        <tr>
          <TableHeaderCell>{keyLabel}</TableHeaderCell>
          <TableHeaderCell align="end">{periodLabel} (USD)</TableHeaderCell>
          <TableHeaderCell>비중 (%)</TableHeaderCell>
          <TableHeaderCell align="end">이번 달 (USD)</TableHeaderCell>
          <TableHeaderCell align="end">전월 대비 (%)</TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className={styles.nowrap}>{renderKey(row.key)}</TableCell>
            <TableCell align="end" className={styles.amount}>
              {formatUsd(row.periodTotal)}
            </TableCell>
            <TableCell>
              <span className={styles.share}>
                <span className={styles.shareValue}>{formatPercent(row.share)}</span>
                <span className={styles.shareTrack} aria-hidden="true">
                  <span
                    className={styles.shareFill}
                    style={{
                      width: `${String(row.share)}%`,
                      backgroundColor: barColor?.(row.key),
                    }}
                  />
                </span>
              </span>
            </TableCell>
            <TableCell align="end" className={styles.amount}>
              {formatUsd(row.current)}
            </TableCell>
            <TableCell align="end" className={styles.amount}>
              {row.change === null
                ? '—'
                : `${row.change > 0 ? '+' : ''}${formatPercent(row.change)}`}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
