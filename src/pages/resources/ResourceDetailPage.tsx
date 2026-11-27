import { List, Pencil, SearchX, Trash2, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { getReturnPath } from '@/app/returnLocation';

import { StatusBadge } from '@/components/data/StatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDERS } from '@/constants/providers';
import { useDemoData } from '@/store/demoData/demoDataContext';
import { useToast } from '@/store/toast/toastContext';
import type { ResourceInput } from '@/types/resource';

import { ResourceDeleteModal } from './components/ResourceDeleteModal';
import { ResourceEventsTab } from './components/ResourceEventsTab';
import { ResourceFormModal } from './components/ResourceFormModal';
import { ResourceMonitoringTab } from './components/ResourceMonitoringTab';
import { ResourceNetworkTab } from './components/ResourceNetworkTab';
import { ResourceOverviewTab } from './components/ResourceOverviewTab';
import styles from './ResourceDetailPage.module.scss';

const TAB_KEYS = ['overview', 'monitoring', 'network', 'events'] as const;
type DetailTab = (typeof TAB_KEYS)[number];

function parseTab(value: string | null): DetailTab {
  return TAB_KEYS.find((key) => key === value) ?? 'overview';
}

/**
 * 리소스 상세(설계서 3-2).
 * - 데이터는 목록과 같은 DemoDataProvider 상태를 읽으므로, 여기서 수정·삭제하면 목록·대시보드·알림에도 바로 반영된다.
 * - 선택한 탭은 ?tab= 쿼리로 둔다(공유·새로고침 시 유지). 같은 경로의 쿼리 변경이라 초점은 이동하지 않는다.
 * - 없는 ID(잘못된 주소, 삭제된 리소스)는 "찾을 수 없음" 상태로 목록 이동을 안내한다.
 */
export function ResourceDetailPage() {
  const { resourceId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useDemoData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [formSession, setFormSession] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  /** 삭제 후 목록으로 이동하는 동안 "찾을 수 없음" 화면이 잠깐 보이지 않게 한다. */
  const [leaving, setLeaving] = useState(false);

  const resource = state.resources.find((item) => item.id === resourceId);
  const events = useMemo(
    () =>
      state.events
        .filter((event) => event.resourceId === resourceId)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [state.events, resourceId],
  );
  const tab = parseTab(searchParams.get('tab'));

  if (state.status === 'loading' || (leaving && !resource)) {
    return (
      <>
        <PageHeader title="리소스 상세" />
        <div className={styles.loading} aria-busy="true">
          <VisuallyHidden>리소스 정보를 불러오는 중</VisuallyHidden>
          <Skeleton width="40%" />
          <Skeleton variant="block" height={240} />
        </div>
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="리소스 상세" />
        <EmptyState
          icon={TriangleAlert}
          title="리소스 정보를 불러오지 못했습니다"
          description="저장된 데모 데이터를 읽는 중 문제가 생겼습니다. 페이지를 새로고침해 주세요."
          className={styles.panelEmpty}
        />
      </>
    );
  }

  if (!resource) {
    return (
      <>
        <PageHeader title="리소스를 찾을 수 없습니다" />
        <EmptyState
          icon={SearchX}
          title="요청한 리소스가 없습니다"
          description={
            <>
              삭제되었거나 주소가 잘못되었습니다. 리소스 ID:{' '}
              <span className={styles.mono}>{resourceId}</span>
            </>
          }
          action={
            <ButtonLink to="/resources" variant="primary" icon={List}>
              리소스 목록으로
            </ButtonLink>
          }
          className={styles.panelEmpty}
        />
      </>
    );
  }

  const provider = PROVIDERS[resource.provider];

  const submitForm = async (input: ResourceInput) => {
    const saved = await actions.updateResource(resource.id, input);
    showToast(`'${saved.name}' 리소스 정보를 수정했습니다.`, 'success');
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await actions.deleteResources([resource.id]);
      setLeaving(true);
      showToast(`'${resource.name}' 리소스를 삭제했습니다.`, 'success');
      // 삭제 후에는 목록으로 이동한다(목록에서 왔으면 그때의 조건 그대로). 라우트 전환이므로 목록의 h1로 초점이 간다.
      void navigate(getReturnPath(location.state, '/resources'));
    } catch (error) {
      showToast(error instanceof Error ? error.message : '삭제하지 못했습니다.', 'error');
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={resource.name}
        description={
          <span className={styles.headerMeta}>
            <StatusBadge status={resource.status} />
            <Badge>{provider.label}</Badge>
            <span className={styles.mono}>{resource.region}</span>
            <span className={styles.metaDivider} aria-hidden="true">
              ·
            </span>
            <span className={styles.mono}>{resource.id}</span>
          </span>
        }
        actions={
          <>
            <Button
              icon={Pencil}
              onClick={() => {
                setFormSession((current) => current + 1);
                setFormOpen(true);
              }}
            >
              수정
            </Button>
            <Button
              icon={Trash2}
              onClick={() => {
                setDeleteOpen(true);
              }}
            >
              삭제
            </Button>
          </>
        }
      />

      <Tabs
        label="리소스 상세 정보"
        value={tab}
        onChange={(next) => {
          // location.state(목록 복귀 정보)를 그대로 넘겨 탭을 바꿔도 목록으로 돌아갈 조건이 남게 한다.
          setSearchParams(next === 'overview' ? {} : { tab: next }, {
            replace: true,
            preventScrollReset: true,
            state: location.state as unknown,
          });
        }}
        items={[
          {
            value: 'overview',
            label: '개요',
            panel: <ResourceOverviewTab resource={resource} events={events} />,
          },
          {
            value: 'monitoring',
            label: '모니터링',
            panel: <ResourceMonitoringTab resource={resource} />,
          },
          {
            value: 'network',
            label: '네트워크',
            panel: <ResourceNetworkTab resource={resource} />,
          },
          {
            value: 'events',
            label: `이벤트 로그 (${String(events.length)})`,
            panel: <ResourceEventsTab events={events} />,
          },
        ]}
      />

      <ResourceFormModal
        key={formSession}
        open={formOpen}
        resource={resource}
        existingNames={state.resources.map((item) => item.name)}
        onClose={() => {
          setFormOpen(false);
        }}
        onSubmit={submitForm}
      />

      <ResourceDeleteModal
        open={deleteOpen}
        targets={[resource]}
        loading={deleting}
        onClose={() => {
          setDeleteOpen(false);
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </>
  );
}
