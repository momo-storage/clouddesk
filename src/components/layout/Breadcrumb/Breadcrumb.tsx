import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { getReturnPath } from '@/app/returnLocation';
import { useRouteCrumbs } from '@/app/routeMeta';

import styles from './Breadcrumb.module.scss';

/**
 * 라우트 정의(handle.title)에서 자동으로 만든 경로 표시.
 * 1단계 페이지는 경로가 페이지 제목(h1)과 같아 중복되므로 2단계 이상일 때만 표시한다.
 */
export function Breadcrumb() {
  const crumbs = useRouteCrumbs();
  // 목록에서 넘어온 경우 상위 목록 링크에 그때의 검색·필터 조건을 붙인다(app/returnLocation.ts).
  const location = useLocation();
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="경로" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.pathname} className={styles.item}>
              {index > 0 && (
                <ChevronRight size={14} className={styles.separator} aria-hidden="true" />
              )}
              {isLast ? (
                <span aria-current="page" className={styles.current}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={getReturnPath(location.state, crumb.pathname)} className={styles.link}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
