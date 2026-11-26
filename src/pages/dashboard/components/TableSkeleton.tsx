import { Skeleton } from '@/components/ui/Skeleton';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';

import styles from '../DashboardPage.module.scss';

/** 표 영역 로딩 상태(행 모양 자리 표시) */
export function TableSkeleton({ label, rows }: { label: string; rows: number }) {
  return (
    <div className={styles.tableSkeleton} aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} width={`${String(90 - (index % 3) * 12)}%`} />
      ))}
    </div>
  );
}
