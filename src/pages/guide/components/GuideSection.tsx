import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from '../GuidePage.module.scss';

interface GuideSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** 가이드의 컴포넌트별 영역. id는 목차 앵커로 쓴다. */
export function GuideSection({ id, title, children }: GuideSectionProps) {
  const headingId = `guide-${id}`;
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {title}
      </h2>
      <div className={styles.examples}>{children}</div>
    </section>
  );
}

interface GuideExampleProps {
  /** 예시가 보여주는 상태(예: "기본", "오류") */
  label: string;
  children: ReactNode;
  wide?: boolean;
}

export function GuideExample({ label, children, wide = false }: GuideExampleProps) {
  return (
    <div className={cn(styles.example, wide && styles.wide)}>
      <p className={styles.exampleLabel}>{label}</p>
      <div className={styles.exampleBody}>{children}</div>
    </div>
  );
}
