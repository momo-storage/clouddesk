import {
  functionalUpdate,
  useTable,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { Checkbox } from '@/components/ui/Checkbox';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

import styles from './DataTable.module.scss';
import { dataTableFeatures, type DataTableColumnDef } from './dataTableFeatures';

export interface DataTablePagination {
  /** 현재 페이지(1부터). 범위를 벗어나지 않게 사용처에서 맞춰 준다. */
  page: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** 페이지 이동 영역(nav)의 이름. 없으면 "{caption} 페이지" */
  label?: string;
}

export interface DataTableSelection<TData extends RowData> {
  /** 선택한 행 ID 목록({ [id]: true }) */
  value: RowSelectionState;
  onChange: (value: RowSelectionState) => void;
  /** 행 선택 체크박스의 접근 가능한 이름(예: "web-01 선택") */
  getRowLabel: (row: TData) => string;
}

export interface DataTableProps<TData extends RowData> {
  /** 표 제목(caption). 스크롤 영역의 이름으로도 쓴다. */
  caption: string;
  hideCaption?: boolean;
  minWidth?: number;
  data: TData[];
  columns: readonly DataTableColumnDef<TData>[];
  getRowId: (row: TData) => string;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  /** 없으면 모든 행을 한 번에 보여준다. */
  pagination?: DataTablePagination;
  /** 있으면 맨 앞에 선택 열을 만든다(현재 페이지 전체 선택 포함). */
  selection?: DataTableSelection<TData>;
  /** 불러오는 중: 머리글은 그대로 두고 행 자리에 Skeleton을 보여준다. */
  loading?: boolean;
  /** 행이 없을 때 표 대신 보여줄 빈 상태(데이터 없음, 검색 결과 없음) */
  emptyState?: ReactNode;
  className?: string;
}

const SKELETON_WIDTHS = ['80%', '64%', '72%', '56%'];

/**
 * 정렬·페이지네이션·행 선택이 있는 데이터 표(TanStack Table + ui/Table + Pagination + Checkbox).
 * 상태는 모두 사용처가 가진다(제어형). 그래서 URL 쿼리와 동기화하거나 삭제 후 선택을 정리하기 쉽다.
 * 정렬 상태는 머리글의 aria-sort로, 선택 상태는 체크박스와 행 배경으로 함께 전달한다.
 */
export function DataTable<TData extends RowData>({
  caption,
  hideCaption,
  minWidth,
  data,
  columns,
  getRowId,
  sorting,
  onSortingChange,
  pagination,
  selection,
  loading = false,
  emptyState,
  className,
}: DataTableProps<TData>) {
  const pageIndex = pagination ? pagination.page - 1 : 0;
  const pageSize = pagination?.pageSize ?? Math.max(data.length, 1);

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
      rowSelection: selection?.value ?? {},
    },
    onSortingChange: (updater) => {
      onSortingChange(functionalUpdate(updater, sorting));
    },
    // 정렬은 오름·내림 두 방향만 오가게 한다(정렬 해제 단계가 있으면 기본 정렬이 무엇인지 알기 어렵다).
    enableSortingRemoval: false,
    // 페이지는 사용처가 URL 쿼리로 관리하므로 데이터가 바뀌어도 표가 임의로 1페이지로 되돌리지 않는다.
    autoResetPageIndex: false,
    enableRowSelection: selection !== undefined,
    onRowSelectionChange: (updater) => {
      selection?.onChange(functionalUpdate(updater, selection.value));
    },
  });

  if (!loading && data.length === 0 && emptyState) {
    return <div className={cn(styles.dataTable, className)}>{emptyState}</div>;
  }

  const rows = table.getRowModel().rows;
  const columnCount = columns.length + (selection ? 1 : 0);

  // 고정 열(PC 전용, 스타일은 DataTable.module.scss). 왼쪽 고정 열이 있으면 선택 열도 함께 고정한다.
  const hasStickyStart = columns.some((column) => column.meta?.sticky === 'start');
  const selectCellClassName = cn(styles.selectCell, hasStickyStart && styles.stickySelect);
  const stickyClassName = (sticky: 'start' | 'end' | undefined) =>
    sticky === 'start'
      ? cn(styles.stickyStart, selection && styles.stickyAfterSelect)
      : sticky === 'end'
        ? styles.stickyEnd
        : undefined;
  const skeletonRowCount = Math.min(pageSize, 10);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const firstItem = data.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastItem = Math.min(data.length, (pageIndex + 1) * pageSize);

  return (
    <div className={cn(styles.dataTable, className)} aria-busy={loading || undefined}>
      <Table caption={caption} hideCaption={hideCaption} minWidth={minWidth}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {selection && (
                <TableHeaderCell className={selectCellClassName}>
                  <Checkbox
                    label="현재 페이지 전체 선택"
                    hideLabel
                    checked={!loading && table.getIsAllPageRowsSelected()}
                    indeterminate={table.getIsSomePageRowsSelected()}
                    disabled={loading || rows.length === 0}
                    onChange={(event) => {
                      table.toggleAllPageRowsSelected(event.target.checked);
                    }}
                  />
                </TableHeaderCell>
              )}
              {headerGroup.headers.map((header) => {
                const { column } = header;
                const meta = column.columnDef.meta;
                const sorted = column.getIsSorted();
                return (
                  <TableHeaderCell
                    key={header.id}
                    align={meta?.align}
                    className={cn(meta?.className, stickyClassName(meta?.sticky))}
                    sortDirection={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                    }
                    onSort={
                      column.getCanSort()
                        ? () => {
                            column.toggleSorting(column.getNextSortingOrder() === 'desc');
                          }
                        : undefined
                    }
                  >
                    <table.FlexRender header={header} />
                  </TableHeaderCell>
                );
              })}
            </tr>
          ))}
        </thead>
        {loading ? (
          // 모양만 보여주는 자리 표시이므로 낭독기에서는 숨기고, 로딩 상태는 aria-busy와 사용처의 상태 문구로 알린다.
          <tbody aria-hidden="true">
            {Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }, (_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton
                      width={
                        selection && cellIndex === 0
                          ? 16
                          : SKELETON_WIDTHS[(rowIndex + cellIndex) % SKELETON_WIDTHS.length]
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        ) : (
          <tbody>
            {rows.map((row) => (
              <TableRow key={row.id} selected={row.getIsSelected()}>
                {selection && (
                  <TableCell className={selectCellClassName}>
                    <Checkbox
                      label={selection.getRowLabel(row.original)}
                      hideLabel
                      checked={row.getIsSelected()}
                      onChange={(event) => {
                        row.toggleSelected(event.target.checked);
                      }}
                    />
                  </TableCell>
                )}
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableCell
                      key={cell.id}
                      align={meta?.align}
                      mono={meta?.mono}
                      className={cn(meta?.className, stickyClassName(meta?.sticky))}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        )}
      </Table>

      {pagination && !loading && data.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.range}>
            {formatNumber(data.length)}개 중 {formatNumber(firstItem)}–{formatNumber(lastItem)}
          </p>
          <div className={styles.footerControls}>
            <Select
              label="페이지당 행 수"
              value={String(pagination.pageSize)}
              options={pagination.pageSizeOptions.map((option) => ({
                value: String(option),
                label: `${String(option)}개`,
              }))}
              onChange={(event) => {
                pagination.onPageSizeChange(Number(event.target.value));
              }}
              fieldClassName={styles.pageSize}
              className={styles.pageSizeSelect}
            />
            <Pagination
              page={pagination.page}
              pageCount={pageCount}
              onPageChange={pagination.onPageChange}
              label={pagination.label ?? `${caption} 페이지`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
