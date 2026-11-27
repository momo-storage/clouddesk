import type { ReactNode } from 'react';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { cn } from '@/utils/cn';

import styles from '../ResourceDetailPage.module.scss';

export interface InfoItem {
  label: string;
  /** null이면 "—"(낭독기에는 "없음")으로 표시한다. */
  value: ReactNode;
  /** 리소스 ID·IP 등 식별자: 고정폭 글꼴 */
  mono?: boolean;
}

/** 이름-값 목록(dl). 상세 개요·네트워크 탭의 속성 표시에 쓴다. */
export function InfoList({ items, columns = 2 }: { items: InfoItem[]; columns?: 1 | 2 }) {
  return (
    <dl className={cn(styles.infoList, columns === 2 && styles.infoListTwo)}>
      {items.map((item) => (
        <div key={item.label} className={styles.infoItem}>
          <dt className={styles.infoLabel}>{item.label}</dt>
          <dd className={cn(styles.infoValue, item.mono && styles.mono)}>
            {item.value ?? (
              <>
                <span aria-hidden="true">—</span>
                <VisuallyHidden>없음</VisuallyHidden>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
