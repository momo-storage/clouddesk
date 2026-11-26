import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';

import styles from './Charts.module.scss';

export interface ChartDataColumn {
  key: string;
  label: string;
  align?: 'start' | 'end';
}

export interface ChartDataTableProps {
  /** 표 제목(차트 제목과 같게) */
  caption: string;
  columns: ChartDataColumn[];
  /** 서식이 적용된 값 */
  rows: Record<string, string>[];
}

/**
 * 차트의 대체 데이터 표(설계서 6-3 ChartDataTable).
 * 차트 그림은 낭독기에서 숨기고, 같은 값을 표로 펼쳐 볼 수 있게 한다. 기본은 접힌 상태다.
 */
export function ChartDataTable({ caption, columns, rows }: ChartDataTableProps) {
  return (
    <details className={styles.dataTable}>
      <summary className={styles.dataTableSummary}>데이터 표로 보기</summary>
      <div className={styles.dataTableBody}>
        <Table caption={caption} hideCaption>
          <thead>
            <tr>
              {columns.map((column) => (
                <TableHeaderCell key={column.key} align={column.align}>
                  {column.label}
                </TableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`${row[columns[0]?.key ?? ''] ?? ''}-${String(rowIndex)}`}>
                {columns.map((column, index) =>
                  index === 0 ? (
                    // 첫 열(시각·항목)은 행 머리글로 둔다.
                    <th key={column.key} scope="row" className={styles.rowHeader}>
                      {row[column.key]}
                    </th>
                  ) : (
                    <TableCell key={column.key} align={column.align}>
                      {row[column.key]}
                    </TableCell>
                  ),
                )}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </details>
  );
}
