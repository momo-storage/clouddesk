/**
 * 목록 → 상세로 이동할 때 목록의 주소(검색·필터·정렬·페이지 쿼리)를 React Router의 location.state로 넘긴다.
 * 상세에서 Breadcrumb·삭제 후 이동으로 목록에 돌아갈 때 이 값이 있으면 그 조건 그대로 돌아가고,
 * 상세 주소로 바로 들어온 경우(state 없음)에는 기본 목록으로 간다. 전역 상태를 따로 두지 않는다.
 */
export interface ReturnLocationState {
  returnTo: { pathname: string; search: string };
}

export function createReturnState(pathname: string, search: string): ReturnLocationState {
  return { returnTo: { pathname, search } };
}

function isReturnState(state: unknown): state is ReturnLocationState {
  if (typeof state !== 'object' || state === null || !('returnTo' in state)) return false;
  const { returnTo } = state;
  return (
    typeof returnTo === 'object' &&
    returnTo !== null &&
    'pathname' in returnTo &&
    'search' in returnTo &&
    typeof returnTo.pathname === 'string' &&
    typeof returnTo.search === 'string'
  );
}

/** pathname으로 돌아갈 주소. 넘겨받은 상태가 같은 경로의 것이면 쿼리까지 붙인다. */
export function getReturnPath(state: unknown, pathname: string): string {
  return isReturnState(state) && state.returnTo.pathname === pathname
    ? `${pathname}${state.returnTo.search}`
    : pathname;
}
