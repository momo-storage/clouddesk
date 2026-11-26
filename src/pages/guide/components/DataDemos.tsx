import { CircleCheck, CircleStop, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  type SortDirection,
} from '@/components/ui/Table';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';

/** 가이드 표시용 예시 행. 실제 화면의 데이터는 Phase 2-5 Mock 데이터를 쓴다. */
const SAMPLE_ROWS = [
  { id: 'i-0a1b2c3d4e5f67890', name: 'web-prod-01', provider: 'AWS', status: 'running', cpu: 72.4 },
  { id: 'vm-7f3e2d1c', name: 'api-prod-02', provider: 'Azure', status: 'running', cpu: 38.1 },
  { id: 'gce-5501928374', name: 'batch-dev-01', provider: 'GCP', status: 'stopped', cpu: 0 },
  { id: 'i-0f9e8d7c6b5a43210', name: 'db-prod-01', provider: 'AWS', status: 'pending', cpu: 91.6 },
] as const;

type SampleRow = (typeof SAMPLE_ROWS)[number];
type SortKey = 'name' | 'cpu';

const STATUS_BADGE: Record<
  SampleRow['status'],
  Pick<BadgeProps, 'tone' | 'icon'> & { label: string }
> = {
  running: { tone: 'success', icon: CircleCheck, label: '실행 중' },
  stopped: { tone: 'neutral', icon: CircleStop, label: '중지됨' },
  pending: { tone: 'warning', icon: LoaderCircle, label: '전환 중' },
};

const numberFormat = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function TableDemo() {
  const [sort, setSort] = useState<{ key: SortKey; direction: Exclude<SortDirection, 'none'> }>({
    key: 'name',
    direction: 'ascending',
  });
  const [selected, setSelected] = useState<string[]>([]);

  const rows = [...SAMPLE_ROWS].sort((a, b) => {
    const order = sort.key === 'name' ? a.name.localeCompare(b.name) : a.cpu - b.cpu;
    return sort.direction === 'ascending' ? order : -order;
  });
  const allSelected = selected.length === rows.length;

  const sortBy = (key: SortKey) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };
  const directionOf = (key: SortKey): SortDirection => (sort.key === key ? sort.direction : 'none');

  return (
    <GuideSection id="table" title="Table">
      <GuideExample label="정렬(머리글 버튼) · 다중 선택 · 숫자 오른쪽 정렬 · 식별자 고정폭" wide>
        <div className={styles.fullWidth}>
          <Table caption="가상 서버 목록 (예시)" minWidth={720}>
            <thead>
              <tr>
                <TableHeaderCell>
                  <Checkbox
                    label="현재 페이지 전체 선택"
                    hideLabel
                    checked={allSelected}
                    indeterminate={selected.length > 0 && !allSelected}
                    onChange={() => {
                      setSelected(allSelected ? [] : rows.map((row) => row.id));
                    }}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  sortDirection={directionOf('name')}
                  onSort={() => {
                    sortBy('name');
                  }}
                >
                  리소스명
                </TableHeaderCell>
                <TableHeaderCell>리소스 ID</TableHeaderCell>
                <TableHeaderCell>제공업체</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell
                  align="end"
                  sortDirection={directionOf('cpu')}
                  onSort={() => {
                    sortBy('cpu');
                  }}
                >
                  CPU (%)
                </TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selected.includes(row.id);
                const badge = STATUS_BADGE[row.status];
                return (
                  <TableRow key={row.id} selected={isSelected}>
                    <TableCell>
                      <Checkbox
                        label={`${row.name} 선택`}
                        hideLabel
                        checked={isSelected}
                        onChange={() => {
                          setSelected((current) =>
                            isSelected
                              ? current.filter((id) => id !== row.id)
                              : [...current, row.id],
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell mono>{row.id}</TableCell>
                    <TableCell>
                      <Badge>{row.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={badge.tone} icon={badge.icon}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell align="end">{numberFormat.format(row.cpu)}</TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
          <p className={styles.tableToolbar} role="status">
            {selected.length > 0 ? `${selected.length}개 선택됨` : '선택한 리소스 없음'}
          </p>
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function PaginationDemo() {
  const [page, setPage] = useState(1);
  const pageCount = 12;

  return (
    <GuideSection id="pagination" title="Pagination">
      <GuideExample label="12페이지 중 이동 (끝 페이지에서 초점이 현재 페이지로 이동)" wide>
        <div className={styles.stack}>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          <p className={styles.mutedText}>
            현재 {page} / {pageCount} 페이지
          </p>
        </div>
      </GuideExample>
    </GuideSection>
  );
}
