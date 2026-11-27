import { Panel } from '@/components/layout/Panel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDERS } from '@/constants/providers';
import { useAsyncValue } from '@/hooks/useAsyncValue';
import { getSecurityRules } from '@/services/networkService';
import type { CloudProvider, Resource } from '@/types/resource';

import styles from '../ResourceDetailPage.module.scss';

import { InfoList } from './InfoList';

/** 제공업체마다 다른 보안 규칙 이름 */
const RULE_SET_NAME: Record<CloudProvider, string> = {
  aws: '보안 그룹',
  azure: '네트워크 보안 그룹(NSG)',
  gcp: 'VPC 방화벽 규칙',
};

function SecurityRuleTable({ resource }: { resource: Resource }) {
  const rules = useAsyncValue(`${resource.id}:${resource.name}:${resource.os}`, () =>
    getSecurityRules(resource),
  );

  if (rules.status === 'loading') {
    return (
      <div className={styles.tableSkeleton} aria-busy="true">
        <VisuallyHidden>보안 규칙을 불러오는 중</VisuallyHidden>
        <Skeleton width="90%" />
        <Skeleton width="78%" />
        <Skeleton width="84%" />
      </div>
    );
  }
  if (rules.status === 'error') {
    return <p className={styles.empty}>보안 규칙을 불러오지 못했습니다.</p>;
  }
  if (rules.data.length === 0) {
    return <p className={styles.empty}>등록된 인바운드 규칙이 없습니다.</p>;
  }
  return (
    <Table caption="인바운드 보안 규칙" hideCaption minWidth={560} className={styles.flushTable}>
      <thead>
        <tr>
          <TableHeaderCell>프로토콜</TableHeaderCell>
          <TableHeaderCell>포트</TableHeaderCell>
          <TableHeaderCell>소스</TableHeaderCell>
          <TableHeaderCell>설명</TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {rules.data.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell mono>{rule.protocol}</TableCell>
            <TableCell mono>{rule.port}</TableCell>
            <TableCell mono>{rule.source}</TableCell>
            <TableCell>{rule.description}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

/** 네트워크: VPC/VNet·서브넷·IP와 인바운드 보안 규칙(설계서 3-2) */
export function ResourceNetworkTab({ resource }: { resource: Resource }) {
  const provider = PROVIDERS[resource.provider];

  return (
    <div className={styles.tabLayout}>
      <Panel title="네트워크 구성">
        <InfoList
          items={[
            { label: provider.networkLabel, value: resource.network, mono: true },
            { label: '서브넷', value: resource.subnet, mono: true },
            { label: '사설 IP', value: resource.privateIp, mono: true },
            { label: '공인 IP', value: resource.publicIp, mono: true },
          ]}
        />
      </Panel>

      <Panel
        title="인바운드 보안 규칙"
        description={`${provider.label} ${RULE_SET_NAME[resource.provider]} · 데모용 규칙`}
        flush
      >
        <SecurityRuleTable resource={resource} />
      </Panel>
    </div>
  );
}
