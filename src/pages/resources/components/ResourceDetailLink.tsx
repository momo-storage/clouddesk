import { Link, useLocation } from 'react-router';

import { createReturnState } from '@/app/returnLocation';
import type { Resource } from '@/types/resource';

import styles from '../ResourceListPage.module.scss';

/**
 * 목록의 리소스명 링크. 지금 목록의 검색·필터·정렬·페이지 쿼리를 함께 넘겨,
 * 상세에서 Breadcrumb으로 돌아올 때 같은 목록 화면으로 돌아오게 한다.
 */
export function ResourceDetailLink({ resource }: { resource: Resource }) {
  const location = useLocation();

  return (
    <Link
      to={`/resources/${resource.id}`}
      state={createReturnState(location.pathname, location.search)}
      className={styles.nameLink}
      data-resource-link=""
    >
      {resource.name}
    </Link>
  );
}
