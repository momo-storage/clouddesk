import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import {
  createDataTableColumnHelper,
  DataTable,
  type RowSelectionState,
  type SortingState,
} from '@/components/data/DataTable';
import { FilterBar } from '@/components/data/FilterBar';
import { StatusBadge } from '@/components/data/StatusBadge';
import { UsageBar } from '@/components/data/UsageBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { useDemoData } from '@/store/demoData/demoDataContext';
import type { CloudProvider, Resource } from '@/types/resource';
import { formatDateTime, formatNumber } from '@/utils/format';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';
import { useDemoAction } from './useDemoAction';

const column = createDataTableColumnHelper<Resource>();
const PAGE_SIZES = [5, 10] as const;

/**
 * DataTable + FilterBar 예시. 실제 데모 데이터(리소스)를 읽기만 하고, 상태는 이 예시 안에서만 관리한다.
 * 리소스 목록 화면과 달리 URL 쿼리와 연결하지 않는다(가이드에서 주소가 바뀌지 않도록).
 */
export function DataTableDemo() {
  const { state } = useDemoData();
  const demo = useDemoAction();
  const [keyword, setKeyword] = useState('');
  const [provider, setProvider] = useState<CloudProvider | ''>('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'cpuUsage', desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor('name', {
          header: '리소스명',
          sortFn: 'alphanumeric',
          meta: { sticky: 'start', className: styles.colName },
          cell: ({ row }) => (
            <Link to={`/resources/${row.original.id}`} className={styles.nameLink}>
              {row.original.name}
            </Link>
          ),
        }),
        column.accessor('id', { header: '리소스 ID', enableSorting: false, meta: { mono: true } }),
        column.accessor((resource) => PROVIDERS[resource.provider].label, {
          id: 'provider',
          header: '제공업체',
          sortFn: 'text',
          cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
        }),
        column.accessor('region', { header: '리전', sortFn: 'alphanumeric', meta: { mono: true } }),
        column.accessor('status', {
          header: '상태',
          enableSorting: false,
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        }),
        column.accessor('cpuUsage', {
          header: 'CPU (%)',
          sortFn: 'basic',
          sortDescFirst: true,
          meta: { align: 'end' },
          cell: ({ getValue }) => <UsageBar value={getValue()} />,
        }),
        column.accessor('createdAt', {
          header: '생성일',
          sortFn: 'basic',
          sortDescFirst: true,
          meta: { className: styles.nowrap },
          cell: ({ getValue }) => formatDateTime(getValue()),
        }),
        column.display({
          id: 'actions',
          header: '관리',
          meta: { sticky: 'end', className: styles.nowrap },
          cell: ({ row }) => (
            <Button size="sm" variant="ghost" onClick={demo(`${row.original.name} 수정`)}>
              <VisuallyHidden>{row.original.name} </VisuallyHidden>수정
            </Button>
          ),
        }),
      ]),
    [demo],
  );

  const filtered = useMemo(() => {
    if (showEmpty) return [];
    const text = keyword.toLowerCase();
    return state.resources.filter(
      (resource) =>
        (provider === '' || resource.provider === provider) &&
        (text === '' || resource.name.toLowerCase().includes(text)),
    );
  }, [state.resources, keyword, provider, showEmpty]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const selectedCount = filtered.filter((resource) => selection[resource.id]).length;
  const hasConditions = keyword !== '' || provider !== '';

  const changeConditions = (apply: () => void) => {
    apply();
    setPage(1);
    setSelection({});
  };

  return (
    <GuideSection id="data-table" title="DataTable · FilterBar">
      <GuideExample
        label="검색(Enter) · 제공업체 필터 · 정렬 · 행 선택 · 페이지 크기 · 1280px 이상에서 리소스명·관리 열 고정"
        wide
      >
        <div className={styles.dataTableDemo}>
          <div className={styles.demoToggles}>
            <Switch
              label="로딩 상태 보기"
              checked={showLoading}
              onChange={(event) => {
                setShowLoading(event.target.checked);
              }}
            />
            <Switch
              label="데이터 없음 상태 보기"
              checked={showEmpty}
              onChange={(event) => {
                setShowEmpty(event.target.checked);
              }}
            />
          </div>

          <FilterBar
            label="예시 리소스 검색"
            keyword={keyword}
            keywordLabel="리소스명"
            keywordPlaceholder="예: prod-web"
            onSearch={(next) => {
              changeConditions(() => {
                setKeyword(next);
              });
            }}
            onReset={() => {
              changeConditions(() => {
                setKeyword('');
                setProvider('');
              });
            }}
            canReset={hasConditions}
          >
            <Select
              label="제공업체"
              placeholder="전체"
              value={provider}
              options={PROVIDER_KEYS.map((key) => ({ value: key, label: PROVIDERS[key].label }))}
              onChange={(event) => {
                changeConditions(() => {
                  setProvider(event.target.value as CloudProvider | '');
                });
              }}
            />
          </FilterBar>

          <p className={styles.tableMeta} role="status">
            {state.status === 'loading' || showLoading
              ? '불러오는 중입니다.'
              : `${formatNumber(filtered.length)}개 · 선택 ${formatNumber(selectedCount)}개`}
          </p>

          <div className={styles.panelBox}>
            <DataTable
              caption="DataTable 예시"
              hideCaption
              minWidth={1180}
              className={styles.flushDataTable}
              data={filtered}
              columns={columns}
              getRowId={(resource) => resource.id}
              loading={state.status === 'loading' || showLoading}
              emptyState={
                <EmptyState
                  icon={SearchX}
                  headingLevel={4}
                  title="표시할 리소스가 없습니다"
                  description="검색어나 필터를 바꾸거나 위의 상태 보기를 끄세요."
                />
              }
              sorting={sorting}
              onSortingChange={(next) => {
                setSorting(next);
                setPage(1);
              }}
              pagination={{
                page: currentPage,
                pageSize,
                pageSizeOptions: PAGE_SIZES,
                label: 'DataTable 예시 페이지',
                onPageChange: setPage,
                onPageSizeChange: (next) => {
                  setPageSize(next);
                  setPage(1);
                },
              }}
              selection={{
                value: selection,
                onChange: setSelection,
                getRowLabel: (resource) => `${resource.name} 선택`,
              }}
            />
          </div>
        </div>
      </GuideExample>
    </GuideSection>
  );
}
