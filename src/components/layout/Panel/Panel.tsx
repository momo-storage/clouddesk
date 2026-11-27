import { useId, type ReactNode, type Ref } from 'react';

import { cn } from '@/utils/cn';

import styles from './Panel.module.scss';

export interface PanelProps {
  /** 영역 제목(h2). 영역의 접근 가능한 이름으로도 쓴다. */
  title: string;
  /** 제목 아래 보조 설명(기간, 기준 등) */
  description?: ReactNode;
  /** 제목 오른쪽 링크·버튼(예: "전체 보기") */
  actions?: ReactNode;
  /** 표처럼 가장자리까지 채우는 내용은 안쪽 여백을 없앤다. */
  flush?: boolean;
  /**
   * 제목에 초점을 옮겨야 할 때(예: 선택 삭제 후 목록 제목) 연결한다(설계서 8-1).
   * 연결하면 제목이 tabIndex=-1을 가져 스크립트로만 초점을 받는다.
   */
  headingRef?: Ref<HTMLHeadingElement>;
  className?: string;
  children: ReactNode;
}

/**
 * 화면의 정보 영역(제목 + 내용). 대시보드·상세·모니터링 화면이 같은 틀을 쓴다.
 * 카드는 그림자 대신 테두리로 구분한다(설계서 7-2).
 */
export function Panel({
  title,
  description,
  actions,
  flush = false,
  headingRef,
  className,
  children,
}: PanelProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn(styles.panel, className)}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={headingRef ? -1 : undefined}
            className={styles.title}
          >
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={cn(styles.body, flush && styles.flush)}>{children}</div>
    </section>
  );
}
