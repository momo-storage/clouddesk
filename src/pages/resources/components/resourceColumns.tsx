import { createDataTableColumnHelper } from '@/components/data/DataTable';
import { StatusBadge } from '@/components/data/StatusBadge';
import { UsageBar } from '@/components/data/UsageBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDERS } from '@/constants/providers';
import { RESOURCE_STATUS_KEYS } from '@/constants/resourceStatus';
import type { Resource } from '@/types/resource';
import { formatDateTime } from '@/utils/format';

import styles from '../ResourceListPage.module.scss';

import { ResourceDetailLink } from './ResourceDetailLink';

/** 행 삭제 후 초점을 옮길 리소스명 링크를 찾는 선택자(설계서 8-1: 다음 행 → 이전 행 → 빈 상태 제목) */
export const RESOURCE_LINK_SELECTOR = '[data-resource-link]';

interface ResourceColumnHandlers {
  onEdit: (resource: Resource) => void;
  /** trigger: 누른 "삭제" 버튼(삭제 후 초점을 옮길 행 위치를 계산하는 데 쓴다) */
  onDelete: (resource: Resource, trigger: HTMLElement) => void;
}

const column = createDataTableColumnHelper<Resource>();

/** 빈 값: "—" 표기 + 낭독기용 "없음"(설계서 7-4) */
const emptyValue = (
  <>
    <span aria-hidden="true">—</span>
    <VisuallyHidden>없음</VisuallyHidden>
  </>
);

/** 리소스 목록 열(지침의 10개 항목). 정렬 대상은 리소스명·제공업체·리전·상태·CPU·생성일(설계서 3-2). */
export function createResourceColumns({ onEdit, onDelete }: ResourceColumnHandlers) {
  return column.columns([
    column.accessor('name', {
      header: '리소스명',
      sortFn: 'alphanumeric',
      // PC에서 가로 스크롤해도 어느 행인지 알 수 있도록 왼쪽에 고정한다.
      meta: { className: styles.colName, sticky: 'start' },
      cell: ({ row }) => <ResourceDetailLink resource={row.original} />,
    }),
    column.accessor('id', {
      header: '리소스 ID',
      enableSorting: false,
      meta: { mono: true },
    }),
    column.accessor((resource) => PROVIDERS[resource.provider].label, {
      id: 'provider',
      header: '제공업체',
      sortFn: 'text',
      cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
    }),
    column.accessor('region', {
      header: '리전',
      sortFn: 'alphanumeric',
      meta: { mono: true },
    }),
    column.accessor('instanceType', {
      header: '인스턴스 유형',
      enableSorting: false,
      meta: { mono: true },
    }),
    column.display({
      id: 'ip',
      header: 'IP 주소(사설 / 공인)',
      meta: { mono: true },
      // 한 줄로 보여준다. 공인 IP가 없으면 "—"(낭독기에는 "없음").
      cell: ({ row }) => (
        <>
          {row.original.privateIp}
          <span className={styles.ipDivider} aria-hidden="true">
            {' / '}
          </span>
          <VisuallyHidden>, 공인 </VisuallyHidden>
          {row.original.publicIp ?? emptyValue}
        </>
      ),
    }),
    // 상태는 실행 중 → 중지됨 → 전환 중 → 오류 순서로 정렬한다(내림차순이면 오류가 먼저).
    column.accessor((resource) => RESOURCE_STATUS_KEYS.indexOf(resource.status), {
      id: 'status',
      header: '상태',
      sortFn: 'basic',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    }),
    column.accessor('cpuUsage', {
      header: 'CPU (%)',
      sortFn: 'basic',
      sortDescFirst: true,
      meta: { align: 'end', className: styles.colUsage },
      cell: ({ getValue }) => <UsageBar value={getValue()} />,
    }),
    column.accessor('createdAt', {
      header: '생성일',
      sortFn: 'basic',
      sortDescFirst: true,
      meta: { className: styles.nowrap },
      cell: ({ getValue }) => (
        <time dateTime={getValue()} className={styles.tabular}>
          {formatDateTime(getValue())}
        </time>
      ),
    }),
    column.display({
      id: 'actions',
      header: '관리',
      // PC에서 가로 스크롤해도 수정·삭제를 바로 누를 수 있도록 오른쪽에 고정한다.
      meta: { className: styles.colActions, sticky: 'end' },
      // 행 작업은 Dropdown 대신 텍스트 버튼으로 두고, 이름에 리소스명을 넣어 어느 행의 버튼인지 알 수 있게 한다(설계서 6-4).
      cell: ({ row }) => (
        <span className={styles.rowActions}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onEdit(row.original);
            }}
          >
            <VisuallyHidden>{row.original.name} </VisuallyHidden>수정
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              onDelete(row.original, event.currentTarget);
            }}
          >
            <VisuallyHidden>{row.original.name} </VisuallyHidden>삭제
          </Button>
        </span>
      ),
    }),
  ]);
}
