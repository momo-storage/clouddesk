import { Link } from 'react-router';

import { StatusBadge } from '@/components/data/StatusBadge';
import { UsageBar } from '@/components/data/UsageBar';
import { Panel } from '@/components/layout/Panel';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { PROVIDERS } from '@/constants/providers';
import { USAGE_THRESHOLD } from '@/constants/thresholds';
import { getTopCpuResources } from '@/services/dashboard';
import type { Resource } from '@/types/resource';

import styles from '../DashboardPage.module.scss';

import { TableSkeleton } from './TableSkeleton';

const LIMIT = 5;

export interface TopResourcesPanelProps {
  /** 데이터를 불러오는 중이면 null */
  resources: Resource[] | null;
}

/** 주요 리소스 상태: CPU 사용률 상위 5개, 경고·위험 표시(설계서 3-2) */
export function TopResourcesPanel({ resources }: TopResourcesPanelProps) {
  const top = resources ? getTopCpuResources(resources, LIMIT) : [];
  const overWarning = resources
    ? resources.filter((resource) => resource.cpuUsage >= USAGE_THRESHOLD.warning).length
    : 0;

  return (
    <Panel
      title="주요 리소스 상태"
      description={
        resources
          ? `CPU 사용률 상위 ${String(LIMIT)}개 · 경고 기준(${String(USAGE_THRESHOLD.warning)}%) 이상 ${String(overWarning)}대`
          : `CPU 사용률 상위 ${String(LIMIT)}개`
      }
      actions={
        <ButtonLink to="/resources" variant="ghost" size="sm">
          전체 리소스 보기
        </ButtonLink>
      }
      flush
    >
      {!resources ? (
        <TableSkeleton label="주요 리소스를 불러오는 중" rows={LIMIT} />
      ) : top.length === 0 ? (
        <p className={styles.empty}>등록된 리소스가 없습니다.</p>
      ) : (
        <Table
          caption="CPU 사용률 상위 리소스"
          hideCaption
          minWidth={720}
          className={styles.flushTable}
        >
          <thead>
            <tr>
              <TableHeaderCell>리소스명</TableHeaderCell>
              <TableHeaderCell>제공업체</TableHeaderCell>
              <TableHeaderCell>리전</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell align="end">CPU (%)</TableHeaderCell>
              <TableHeaderCell align="end">메모리 (%)</TableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {top.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className={styles.nowrap}>
                  <Link to={`/resources/${resource.id}`}>{resource.name}</Link>
                  <span className={styles.subTextMono}>{resource.instanceType}</span>
                </TableCell>
                <TableCell>
                  <Badge>{PROVIDERS[resource.provider].label}</Badge>
                </TableCell>
                <TableCell mono>{resource.region}</TableCell>
                <TableCell>
                  <StatusBadge status={resource.status} />
                </TableCell>
                <TableCell align="end">
                  <UsageBar value={resource.cpuUsage} />
                </TableCell>
                <TableCell align="end">
                  <UsageBar value={resource.memoryUsage} />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}
