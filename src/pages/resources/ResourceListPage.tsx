import { Plus, SearchX, Server, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DataTable, type RowSelectionState } from '@/components/data/DataTable';
import { FilterBar } from '@/components/data/FilterBar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/layout/Panel';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import { RESOURCE_STATUS_KEYS, RESOURCE_STATUS_LABEL } from '@/constants/resourceStatus';
import { useDemoData } from '@/store/demoData/demoDataContext';
import { useToast } from '@/store/toast/toastContext';
import type { CloudProvider, Resource, ResourceInput, ResourceStatus } from '@/types/resource';
import { formatNumber } from '@/utils/format';

import { createResourceColumns, RESOURCE_LINK_SELECTOR } from './components/resourceColumns';
import { ResourceFormModal } from './components/ResourceFormModal';
import {
  filterResources,
  hasFilterConditions,
  RESOURCE_PAGE_SIZES,
  useResourceListQuery,
} from './resourceListQuery';
import styles from './ResourceListPage.module.scss';

interface FormState {
  open: boolean;
  /** 열 때마다 바꿔 폼을 새로 마운트한다(입력값 초기화). */
  session: number;
  resource: Resource | null;
}

interface DeleteState {
  open: boolean;
  targets: Resource[];
  bulk: boolean;
  /** 단건 삭제한 행이 현재 페이지에서 몇 번째였는지(0부터) */
  rowIndex: number;
}

/** 삭제 확인 모달에 이름을 모두 나열하는 최대 개수 */
const DELETE_NAME_LIMIT = 5;

/**
 * 리소스 관리 목록(설계서 3-2).
 * - 검색·필터·정렬·페이지는 URL 쿼리(useResourceListQuery), 행 선택은 화면 상태로 둔다.
 * - 데이터 변경은 DemoDataProvider의 actions만 사용하고, 결과는 Toast로 알린다.
 * - 초점: 쿼리 변경에는 이동하지 않고, 삭제로 실행 요소가 사라지면 설계서 8-1의 순서로 옮긴다.
 */
export function ResourceListPage() {
  const { state, actions } = useDemoData();
  const { showToast } = useToast();
  const { query, updateQuery } = useResourceListQuery();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [form, setForm] = useState<FormState>({ open: false, session: 0, resource: null });
  const [deleteState, setDeleteState] = useState<DeleteState>({
    open: false,
    targets: [],
    bulk: false,
    rowIndex: 0,
  });
  const [deleting, setDeleting] = useState(false);

  const tableAreaRef = useRef<HTMLDivElement>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const emptyTitleRef = useRef<HTMLHeadingElement>(null);

  const loading = state.status === 'loading';
  const filtered = useMemo(() => filterResources(state.resources, query), [state.resources, query]);
  const hasConditions = hasFilterConditions(query);
  const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  // 주소의 페이지가 범위를 넘거나 삭제로 마지막 페이지가 사라지면 마지막 페이지를 보여준다.
  const page = Math.min(query.page, pageCount);

  // 선택은 현재 조건의 결과에 남아 있는 리소스만 센다. 보이지 않는 리소스가 함께 삭제되는 일을 막는다.
  const selectedResources = filtered.filter((resource) => rowSelection[resource.id]);
  const validSelection = Object.fromEntries(
    selectedResources.map((resource) => [resource.id, true as const]),
  );

  const columns = useMemo(
    () =>
      createResourceColumns({
        onEdit: (resource) => {
          setForm((current) => ({ open: true, session: current.session + 1, resource }));
        },
        onDelete: (resource, trigger) => {
          // 삭제할 행이 현재 페이지에서 몇 번째인지 기억해 두고, 삭제 후 같은 위치의 행으로 초점을 옮긴다.
          const row = trigger.closest('tr');
          const rowIndex = row?.parentElement
            ? Array.from(row.parentElement.children).indexOf(row)
            : 0;
          setDeleteState({ open: true, targets: [resource], bulk: false, rowIndex });
        },
      }),
    [],
  );

  const changeConditions = (patch: Parameters<typeof updateQuery>[0]) => {
    // 조건이 바뀌면 이전 결과에서 고른 선택은 의미가 없으므로 비운다.
    setRowSelection({});
    updateQuery(patch);
  };

  const resetConditions = () => {
    changeConditions({ keyword: '', provider: null, status: null });
  };

  // 빈 상태의 "조건 초기화" 버튼은 누르면 사라진다. 주소(쿼리)가 바뀌어 목록이 다시 그려진 뒤 목록 제목으로 초점을 옮긴다.
  const focusHeadingAfterQueryChangeRef = useRef(false);
  useEffect(() => {
    if (!focusHeadingAfterQueryChangeRef.current) return;
    focusHeadingAfterQueryChangeRef.current = false;
    (emptyTitleRef.current ?? listHeadingRef.current)?.focus();
  }, [query]);

  const openCreateForm = () => {
    setForm((current) => ({ open: true, session: current.session + 1, resource: null }));
  };

  const closeForm = () => {
    setForm((current) => ({ ...current, open: false }));
  };

  const submitForm = async (input: ResourceInput) => {
    const target = form.resource;
    if (target) {
      const saved = await actions.updateResource(target.id, input);
      showToast(`'${saved.name}' 리소스 정보를 수정했습니다.`, 'success');
    } else {
      const saved = await actions.createResource(input);
      showToast(`'${saved.name}' 리소스를 등록했습니다.`, 'success');
    }
    closeForm();
  };

  const closeDelete = () => {
    setDeleteState((current) => ({ ...current, open: false }));
  };

  const confirmDelete = async () => {
    const { targets, bulk } = deleteState;
    setDeleting(true);
    try {
      const deletedIds = await actions.deleteResources(targets.map((resource) => resource.id));
      setRowSelection((current) =>
        Object.fromEntries(Object.entries(current).filter(([id]) => !deletedIds.includes(id))),
      );
      showToast(
        bulk || targets.length > 1
          ? `리소스 ${formatNumber(deletedIds.length)}개를 삭제했습니다.`
          : `'${targets[0]?.name ?? ''}' 리소스를 삭제했습니다.`,
        'success',
      );
      setDeleteState((current) => ({ ...current, open: false }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : '삭제하지 못했습니다.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // 삭제 후 실행 요소(행의 "삭제" 버튼, "선택 삭제" 버튼)가 사라졌을 때 초점을 받을 곳(설계서 8-1)
  const deleteFallbackFocus = (): HTMLElement | null => {
    if (deleteState.bulk) return emptyTitleRef.current ?? listHeadingRef.current;
    const links = Array.from(
      tableAreaRef.current?.querySelectorAll<HTMLElement>(RESOURCE_LINK_SELECTOR) ?? [],
    );
    const index = deleteState.rowIndex;
    return (
      links[index] ??
      links[index - 1] ??
      links.at(-1) ??
      emptyTitleRef.current ??
      listHeadingRef.current
    );
  };

  const resultStatus = loading
    ? '리소스 목록을 불러오는 중입니다.'
    : hasConditions
      ? `검색 결과 ${formatNumber(filtered.length)}개 · 전체 ${formatNumber(state.resources.length)}개`
      : `전체 ${formatNumber(state.resources.length)}개`;

  const emptyState =
    state.status === 'error' ? (
      <EmptyState
        icon={TriangleAlert}
        headingLevel={3}
        titleRef={emptyTitleRef}
        title="리소스 목록을 불러오지 못했습니다"
        description="저장된 데모 데이터를 읽는 중 문제가 생겼습니다. 페이지를 새로고침해 주세요."
        action={
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            새로고침
          </Button>
        }
      />
    ) : state.resources.length === 0 ? (
      <EmptyState
        icon={Server}
        headingLevel={3}
        titleRef={emptyTitleRef}
        title="등록된 리소스가 없습니다"
        description="AWS, Azure, GCP 가상 서버를 등록하면 이 목록에서 상태와 사용률을 관리할 수 있습니다."
        action={
          <Button variant="primary" icon={Plus} onClick={openCreateForm}>
            리소스 등록
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={SearchX}
        headingLevel={3}
        titleRef={emptyTitleRef}
        title="조건에 맞는 리소스가 없습니다"
        description="검색어나 필터를 바꾸거나 조건을 초기화해 보세요."
        action={
          <Button
            onClick={() => {
              focusHeadingAfterQueryChangeRef.current = true;
              resetConditions();
            }}
          >
            조건 초기화
          </Button>
        }
      />
    );

  const deleteTargets = deleteState.targets;

  return (
    <>
      <PageHeader
        title="리소스 관리"
        description="AWS, Azure, GCP의 가상 서버를 검색하고 등록·수정·삭제합니다."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            aria-disabled={loading || undefined}
            onClick={openCreateForm}
          >
            리소스 등록
          </Button>
        }
      />

      <div className={styles.layout}>
        <FilterBar
          label="리소스 검색"
          keyword={query.keyword}
          keywordLabel="검색어"
          keywordPlaceholder="리소스명, 리소스 ID, IP 주소"
          onSearch={(keyword) => {
            changeConditions({ keyword });
          }}
          onReset={resetConditions}
          canReset={hasConditions}
        >
          <Select
            label="제공업체"
            placeholder="전체"
            value={query.provider ?? ''}
            options={PROVIDER_KEYS.map((key) => ({ value: key, label: PROVIDERS[key].label }))}
            onChange={(event) => {
              changeConditions({ provider: (event.target.value || null) as CloudProvider | null });
            }}
          />
          <Select
            label="상태"
            placeholder="전체"
            value={query.status ?? ''}
            options={RESOURCE_STATUS_KEYS.map((key) => ({
              value: key,
              label: RESOURCE_STATUS_LABEL[key],
            }))}
            onChange={(event) => {
              changeConditions({ status: (event.target.value || null) as ResourceStatus | null });
            }}
          />
        </FilterBar>

        <Panel
          title="리소스 목록"
          headingRef={listHeadingRef}
          description={
            // 검색·필터 결과 건수를 낭독기에 알린다(초점은 옮기지 않는다, 설계서 8-1).
            <span role="status" className={styles.resultStatus}>
              {resultStatus}
            </span>
          }
          actions={
            selectedResources.length > 0 && (
              <div className={styles.selectionBar}>
                <span className={styles.selectionCount}>
                  {formatNumber(selectedResources.length)}개 선택됨
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRowSelection({});
                    // 누른 버튼이 사라지므로 목록 제목으로 초점을 옮긴다(제목은 그대로 남는다).
                    listHeadingRef.current?.focus();
                  }}
                >
                  선택 해제
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => {
                    setDeleteState({
                      open: true,
                      targets: selectedResources,
                      bulk: true,
                      rowIndex: 0,
                    });
                  }}
                >
                  선택 삭제
                </Button>
              </div>
            )
          }
          flush
        >
          <div ref={tableAreaRef}>
            <DataTable
              // 감싸는 영역(Panel) 이름 "리소스 목록"과 같으면 같은 이름의 영역이 두 개가 되므로 표 이름을 따로 준다.
              caption="가상 서버 리소스"
              hideCaption
              minWidth={1240}
              className={styles.table}
              data={filtered}
              columns={columns}
              getRowId={(resource) => resource.id}
              loading={loading}
              emptyState={emptyState}
              sorting={[query.sort]}
              onSortingChange={(sorting) => {
                const next = sorting[0];
                if (next) {
                  updateQuery({ sort: { id: next.id as typeof query.sort.id, desc: next.desc } });
                }
              }}
              pagination={{
                page,
                pageSize: query.pageSize,
                pageSizeOptions: RESOURCE_PAGE_SIZES,
                label: '리소스 목록 페이지',
                onPageChange: (nextPage) => {
                  updateQuery({ page: nextPage });
                },
                onPageSizeChange: (pageSize) => {
                  updateQuery({ pageSize });
                },
              }}
              selection={{
                value: validSelection,
                onChange: setRowSelection,
                getRowLabel: (resource) => `${resource.name} 선택`,
              }}
            />
          </div>
        </Panel>
      </div>

      <ResourceFormModal
        key={form.session}
        open={form.open}
        resource={form.resource}
        existingNames={state.resources.map((resource) => resource.name)}
        onClose={closeForm}
        onSubmit={submitForm}
        fallbackFocus={() => listHeadingRef.current}
      />

      <ConfirmModal
        open={deleteState.open}
        onClose={closeDelete}
        onConfirm={() => {
          void confirmDelete();
        }}
        title={deleteState.bulk ? '선택한 리소스 삭제' : '리소스 삭제'}
        confirmLabel="삭제"
        loading={deleting}
        fallbackFocus={deleteFallbackFocus}
      >
        {deleteState.bulk ? (
          <>
            <p>선택한 리소스 {formatNumber(deleteTargets.length)}개를 삭제하시겠습니까?</p>
            <ul className={styles.deleteList}>
              {deleteTargets.slice(0, DELETE_NAME_LIMIT).map((resource) => (
                <li key={resource.id}>{resource.name}</li>
              ))}
              {deleteTargets.length > DELETE_NAME_LIMIT && (
                <li>외 {formatNumber(deleteTargets.length - DELETE_NAME_LIMIT)}개</li>
              )}
            </ul>
          </>
        ) : (
          <p>
            <strong className={styles.deleteName}>{deleteTargets[0]?.name}</strong>{' '}
            <span className={styles.mono}>({deleteTargets[0]?.id})</span> 리소스를 삭제하시겠습니까?
          </p>
        )}
        <p className={styles.deleteNote}>
          데모 데이터에서만 삭제되며, 사용자 메뉴의 &lsquo;데모 데이터 초기화&rsquo;로 되돌릴 수
          있습니다.
        </p>
      </ConfirmModal>
    </>
  );
}
