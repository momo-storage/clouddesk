import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type ColumnHelper,
  type RowData,
} from '@tanstack/react-table';

/** 열마다 다른 표시 방식. 정렬 규칙(숫자는 오른쪽)과 식별자 글꼴을 열 정의에서 정한다(설계서 7-4). */
export interface DataTableColumnMeta {
  align?: 'start' | 'end' | 'center';
  /** 리소스 ID·IP 등 식별자: 고정폭 글꼴, 말줄임 없음 */
  mono?: boolean;
  /** 열 폭 등 열 단위 스타일(머리글과 셀에 함께 붙는다) */
  className?: string;
  /**
   * 가로 스크롤할 때 PC(1280px 이상)에서 고정할 위치. start는 왼쪽(선택 열 바로 다음), end는 오른쪽.
   * 양쪽 각각 한 열만 고정한다고 가정한다. 1280px 미만에서는 고정하지 않고 표 전체를 스크롤한다.
   */
  sticky?: 'start' | 'end';
}

/**
 * DataTable이 쓰는 TanStack Table 기능. v9는 쓰는 기능만 등록해 번들에 넣는다.
 * 필터링은 화면마다 조건이 달라(검색 대상·URL 쿼리) 화면에서 처리하고, 표는 정렬·페이지·선택만 맡는다.
 */
// 열 meta의 형식만 알려 주는 값(실행 시에는 쓰이지 않는다).
const columnMeta: DataTableColumnMeta = {};

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
  columnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

/** 열 정의 도우미. 값 형식을 열마다 추론한다. */
export function createDataTableColumnHelper<TData extends RowData>(): ColumnHelper<
  DataTableFeatures,
  TData
> {
  return createColumnHelper<DataTableFeatures, TData>();
}
