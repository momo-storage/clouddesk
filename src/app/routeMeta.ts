import { useMatches, type Params } from 'react-router';

/**
 * 라우트 정의의 handle에 두는 메타 정보.
 * 문서 제목(document.title)과 Breadcrumb을 이 값 하나에서 만든다.
 */
export interface RouteHandle {
  /** 페이지 이름. 동적 경로는 params로 이름을 만든다. */
  title: string | ((params: Params) => string);
}

export interface RouteCrumb {
  label: string;
  pathname: string;
}

function isRouteHandle(handle: unknown): handle is RouteHandle {
  if (typeof handle !== 'object' || handle === null || !('title' in handle)) return false;
  const { title } = handle;
  return typeof title === 'string' || typeof title === 'function';
}

/** 현재 경로에서 handle이 있는 라우트를 상위부터 순서대로 돌려준다. 마지막 항목이 현재 페이지다. */
export function useRouteCrumbs(): RouteCrumb[] {
  const matches = useMatches();

  return matches.flatMap((match) => {
    const { handle } = match;
    if (!isRouteHandle(handle)) return [];
    const label = typeof handle.title === 'function' ? handle.title(match.params) : handle.title;
    return [{ label, pathname: match.pathname }];
  });
}
