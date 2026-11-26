import type { ReactNode } from 'react';

import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** 페이지 주요 액션 버튼 영역 */
  actions?: ReactNode;
}

/**
 * 페이지 제목(h1), 설명, 주요 액션.
 * h1은 tabIndex={-1}로 두어 라우트 전환 시 AppLayout이 초점을 옮길 수 있게 한다(Tab 순서에는 들어가지 않음).
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.text}>
        <h1 tabIndex={-1} className={styles.title}>
          {title}
        </h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
