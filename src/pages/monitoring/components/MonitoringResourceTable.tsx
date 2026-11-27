import { Link } from 'react-router';

import { UsageBar } from '@/components/data/UsageBar';
import { Panel } from '@/components/layout/Panel';
import { Badge } from '@/components/ui/Badge';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { PROVIDERS } from '@/constants/providers';
import type { Resource } from '@/types/resource';

import styles from '../MonitoringPage.module.scss';

const LIMIT = 10;

/** 가장 높은 사용률(CPU·메모리·디스크 중 최댓값) 순으로 정렬한다. */
const peakUsage = (resource: Resource) =>
  Math.max(resource.cpuUsage, resource.memoryUsage, resource.diskUsage);

export interface MonitoringResourceTableProps {
  /** 모니터링 대상 리소스(필터 적용 후) */
  resources: Resource[];
  /** 리소스 필터로 고른 리소스(행을 선택 상태로 표시) */
  selectedId?: string;
}

/** 주요 리소스 사용률: 사용률이 높은 순 10대. 리소스명으로 상세(모니터링 탭)에 이동한다. */
export function MonitoringResourceTable({ resources, selectedId }: MonitoringResourceTableProps) {
  const rows = [...resources].sort((a, b) => peakUsage(b) - peakUsage(a)).slice(0, LIMIT);

  return (
    <Panel
      title="주요 리소스 사용률"
      description={`가장 높은 사용률 순 상위 ${String(rows.length)}대 · 전체 ${String(resources.length)}대`}
      flush
    >
      <Table caption="사용률 상위 리소스" hideCaption minWidth={760} className={styles.flushTable}>
        <thead>
          <tr>
            <TableHeaderCell>리소스명</TableHeaderCell>
            <TableHeaderCell>제공업체</TableHeaderCell>
            <TableHeaderCell>리전</TableHeaderCell>
            <TableHeaderCell align="end">CPU (%)</TableHeaderCell>
            <TableHeaderCell align="end">메모리 (%)</TableHeaderCell>
            <TableHeaderCell align="end">디스크 (%)</TableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((resource) => (
            <TableRow key={resource.id} selected={resource.id === selectedId}>
              <TableCell className={styles.nowrap}>
                <Link to={`/resources/${resource.id}?tab=monitoring`}>{resource.name}</Link>
              </TableCell>
              <TableCell>
                <Badge>{PROVIDERS[resource.provider].label}</Badge>
              </TableCell>
              <TableCell mono>{resource.region}</TableCell>
              <TableCell align="end">
                <UsageBar value={resource.cpuUsage} />
              </TableCell>
              <TableCell align="end">
                <UsageBar value={resource.memoryUsage} />
              </TableCell>
              <TableCell align="end">
                <UsageBar value={resource.diskUsage} />
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}
