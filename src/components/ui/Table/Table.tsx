import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Table.module.scss';

export interface TableProps {
  /** 표 제목(caption). 스크롤 영역의 이름으로도 쓴다. */
  caption: string;
  /** 화면 위쪽에 이미 같은 제목이 있으면 caption을 시각적으로만 숨긴다. */
  hideCaption?: boolean;
  /** 이 폭보다 좁아지면 표 영역만 가로로 스크롤한다(페이지 전체 스크롤 방지). */
  minWidth?: number;
  children: ReactNode;
  className?: string;
}

/**
 * 데이터 표의 바탕(caption + 가로 스크롤 영역).
 * 머리글·행·셀은 아래 하위 컴포넌트로 구성하고, thead·tbody는 네이티브 요소를 그대로 쓴다.
 * 정렬·선택·페이지 상태는 DataTable(TanStack Table)에서 다룬다.
 *
 * 스크롤 영역은 키보드로 스크롤할 수 있도록 tabIndex=0과 이름(region)을 준다.
 */
export function Table({ caption, hideCaption = false, minWidth, children, className }: TableProps) {
  const captionId = useId();

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 가로 스크롤 영역을 키보드로 스크롤하기 위해 필요하다(WCAG 2.1.1).
      tabIndex={0}
      className={cn(styles.scroller, className)}
    >
      <table className={styles.table} style={minWidth ? { minWidth } : undefined}>
        <caption id={captionId} className={hideCaption ? styles.captionHidden : styles.caption}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

/** 정렬 방향. 'none'은 정렬 가능하지만 현재 이 열로 정렬하지 않은 상태 */
export type SortDirection = 'ascending' | 'descending' | 'none';
type CellAlign = 'start' | 'end' | 'center';

export interface TableHeaderCellProps extends Omit<ComponentProps<'th'>, 'align'> {
  align?: CellAlign;
  /** 정렬 가능한 열의 현재 정렬 방향. onSort를 주면 머리글 안에 정렬 버튼을 만든다. */
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export function TableHeaderCell({
  align = 'start',
  sortDirection = 'none',
  onSort,
  className,
  children,
  scope = 'col',
  ...props
}: TableHeaderCellProps) {
  const sortable = onSort !== undefined;
  const sorted = sortDirection !== 'none';
  const SortIcon =
    sortDirection === 'ascending'
      ? ArrowUp
      : sortDirection === 'descending'
        ? ArrowDown
        : ArrowUpDown;

  return (
    <th
      {...props}
      scope={scope}
      // 정렬 상태는 머리글의 aria-sort로 전달한다. 정렬 가능한 열만 값을 가진다.
      aria-sort={sortable ? sortDirection : undefined}
      className={cn(styles.headerCell, styles[align], className)}
    >
      {sortable ? (
        <button
          type="button"
          className={cn(styles.sortButton, sorted && styles.sorted)}
          onClick={onSort}
        >
          {children}
          <SortIcon size={14} className={styles.sortIcon} aria-hidden="true" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableRowProps extends ComponentProps<'tr'> {
  /** 선택된 행: 배경색 + 체크박스 상태로 이중 표시한다(설계서 7-4). */
  selected?: boolean;
}

export function TableRow({ selected = false, className, ...props }: TableRowProps) {
  return <tr {...props} className={cn(styles.row, selected && styles.selected, className)} />;
}

export interface TableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  align?: CellAlign;
  /** 리소스 ID·IP 등 식별자: 고정폭 글꼴, 말줄임 없이 전체 표시 */
  mono?: boolean;
}

export function TableCell({ align = 'start', mono = false, className, ...props }: TableCellProps) {
  return (
    <td {...props} className={cn(styles.cell, styles[align], mono && styles.mono, className)} />
  );
}
