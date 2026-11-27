import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { PROVIDER_KEYS } from '@/constants/providers';
import { RESOURCE_STATUS_KEYS } from '@/constants/resourceStatus';
import type { CloudProvider, Resource, ResourceStatus } from '@/types/resource';

/**
 * 리소스 목록의 검색·필터·정렬·페이지 상태를 URL 쿼리로 관리한다.
 * 주소를 공유하거나 새로고침해도 같은 화면이 나오고, 대시보드의 "/resources?status=running" 링크가 그대로 필터가 된다.
 * 기본값은 주소에 쓰지 않아 주소를 짧게 유지한다.
 */

export const RESOURCE_PAGE_SIZES = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 20;

export const RESOURCE_SORT_IDS = [
  'name',
  'provider',
  'region',
  'status',
  'cpuUsage',
  'createdAt',
] as const;
export type ResourceSortId = (typeof RESOURCE_SORT_IDS)[number];

export interface ResourceSort {
  id: ResourceSortId;
  desc: boolean;
}

/** 기본 정렬: 최근에 만든 리소스가 위로(새로 등록한 리소스를 바로 확인할 수 있다) */
const DEFAULT_SORT: ResourceSort = { id: 'createdAt', desc: true };

export interface ResourceListQuery {
  keyword: string;
  provider: CloudProvider | null;
  status: ResourceStatus | null;
  sort: ResourceSort;
  /** 1부터. 마지막 페이지를 넘는 값은 화면에서 마지막 페이지로 맞춘다. */
  page: number;
  pageSize: number;
}

const PARAM = {
  keyword: 'q',
  provider: 'provider',
  status: 'status',
  sort: 'sort',
  order: 'order',
  page: 'page',
  pageSize: 'size',
} as const;

function pickKey<T extends string>(keys: readonly T[], value: string | null): T | null {
  return keys.find((key) => key === value) ?? null;
}

function parsePositiveInt(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= 1 ? number : null;
}

/** 알 수 없는 값은 버리고 기본값을 쓴다(잘못된 주소로 들어와도 화면이 깨지지 않게). */
export function parseResourceListQuery(params: URLSearchParams): ResourceListQuery {
  const sortId = pickKey(RESOURCE_SORT_IDS, params.get(PARAM.sort));
  const order = params.get(PARAM.order);
  const pageSize = parsePositiveInt(params.get(PARAM.pageSize));

  return {
    keyword: params.get(PARAM.keyword)?.trim() ?? '',
    provider: pickKey(PROVIDER_KEYS, params.get(PARAM.provider)),
    status: pickKey(RESOURCE_STATUS_KEYS, params.get(PARAM.status)),
    sort: sortId ? { id: sortId, desc: order === 'desc' } : DEFAULT_SORT,
    page: parsePositiveInt(params.get(PARAM.page)) ?? 1,
    pageSize: RESOURCE_PAGE_SIZES.find((size) => size === pageSize) ?? DEFAULT_PAGE_SIZE,
  };
}

function toSearchParams(query: ResourceListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.keyword) params.set(PARAM.keyword, query.keyword);
  if (query.provider) params.set(PARAM.provider, query.provider);
  if (query.status) params.set(PARAM.status, query.status);
  if (query.sort.id !== DEFAULT_SORT.id || query.sort.desc !== DEFAULT_SORT.desc) {
    params.set(PARAM.sort, query.sort.id);
    params.set(PARAM.order, query.sort.desc ? 'desc' : 'asc');
  }
  if (query.page > 1) params.set(PARAM.page, String(query.page));
  if (query.pageSize !== DEFAULT_PAGE_SIZE) params.set(PARAM.pageSize, String(query.pageSize));
  return params;
}

export function hasFilterConditions(query: ResourceListQuery): boolean {
  return query.keyword !== '' || query.provider !== null || query.status !== null;
}

/** 검색어는 리소스명·ID·사설/공인 IP에서 대소문자 구분 없이 찾는다(설계서 3-2). */
export function filterResources(resources: Resource[], query: ResourceListQuery): Resource[] {
  const keyword = query.keyword.toLowerCase();
  return resources.filter(
    (resource) =>
      (query.provider === null || resource.provider === query.provider) &&
      (query.status === null || resource.status === query.status) &&
      (keyword === '' ||
        [resource.name, resource.id, resource.privateIp, resource.publicIp ?? ''].some((value) =>
          value.toLowerCase().includes(keyword),
        )),
  );
}

/**
 * URL 쿼리를 읽고 고치는 훅.
 * 같은 경로의 쿼리만 바뀌므로 초점은 이동하지 않는다(설계서 8-1). 검색·필터·정렬 변경은 1페이지로 돌아간다.
 * 목록 안의 조작마다 방문 기록이 쌓이지 않도록 현재 기록을 바꾼다(뒤로 가기는 이전 화면으로).
 */
export function useResourceListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseResourceListQuery(searchParams), [searchParams]);

  const updateQuery = useCallback(
    (patch: Partial<ResourceListQuery>) => {
      setSearchParams(
        (current) => {
          const previous = parseResourceListQuery(current);
          const conditionChanged = (
            ['keyword', 'provider', 'status', 'sort', 'pageSize'] as const
          ).some((key) => key in patch);
          return toSearchParams({
            ...previous,
            ...(conditionChanged ? { page: 1 } : {}),
            ...patch,
          });
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  return { query, updateQuery };
}
