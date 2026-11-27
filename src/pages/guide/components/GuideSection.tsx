import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from '../GuidePage.module.scss';
import { getSectionDescription } from '../guideSections';

interface GuideGroupProps {
  id: string;
  title: string;
  /** 이 분류의 컴포넌트가 어디에 쓰이는지 한 줄 설명 */
  description: string;
  children: ReactNode;
}

/** 컴포넌트 분류(입력·액션, 표시, 데이터, 차트 등). 제목은 h2, 안의 컴포넌트 영역은 h3. */
export function GuideGroup({ id, title, description, children }: GuideGroupProps) {
  const headingId = `group-${id}`;
  return (
    <section id={id} aria-labelledby={headingId} className={styles.group}>
      <div className={styles.groupHeader}>
        <h2 id={headingId} className={styles.groupTitle}>
          {title}
        </h2>
        <p className={styles.groupDescription}>{description}</p>
      </div>
      <div className={styles.sections}>{children}</div>
    </section>
  );
}

interface GuideSectionProps {
  id: string;
  title: string;
  /** 컴포넌트 용도 한 줄 설명. 없으면 guideSections.ts의 설명을 쓴다. */
  description?: string;
  children: ReactNode;
}

/** 가이드의 컴포넌트별 영역. id는 목차 앵커로 쓴다. */
export function GuideSection({ id, title, description, children }: GuideSectionProps) {
  const headingId = `guide-${id}`;
  const text = description ?? getSectionDescription(id);
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {title}
      </h3>
      {text && <p className={styles.sectionDescription}>{text}</p>}
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
