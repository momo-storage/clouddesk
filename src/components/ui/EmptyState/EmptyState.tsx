import type { LucideIcon } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import { cn } from '@/utils/cn';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  icon?: LucideIcon;
  /** 무엇이 없는지(예: "등록된 리소스가 없습니다") */
  title: string;
  /** 원인 또는 다음에 할 일 */
  description?: ReactNode;
  /** 다음 행동 버튼(예: 리소스 등록, 조건 초기화) */
  action?: ReactNode;
  /** 문서 제목 구조에 맞는 수준. 페이지 섹션 안이면 3 이상 */
  headingLevel?: 2 | 3 | 4;
  /** 마지막 행을 삭제한 뒤 초점을 받을 대상이 되므로 제목에 ref를 연결할 수 있다(설계서 8-1). */
  titleRef?: Ref<HTMLHeadingElement>;
  className?: string;
}

/** 데이터 없음·검색 결과 없음 등 빈 상태. 원인과 다음 행동을 글로 안내한다. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel = 2,
  titleRef,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <div className={cn(styles.emptyState, className)}>
      {Icon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon size={20} />
        </span>
      )}
      <Heading ref={titleRef} tabIndex={-1} className={styles.title}>
        {title}
      </Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
