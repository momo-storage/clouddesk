import styles from './PagePlaceholder.module.scss';

export interface PagePlaceholderProps {
  /** 이 화면에서 구현할 주요 항목(설계서 3장) */
  items: string[];
}

/**
 * Phase 2-3 레이아웃 검토용 임시 본문.
 * 각 화면의 실제 콘텐츠는 Phase 3에서 구현하며, 그때 이 컴포넌트를 삭제한다.
 */
export function PagePlaceholder({ items }: PagePlaceholderProps) {
  return (
    <section className={styles.placeholder} aria-labelledby="page-placeholder-title">
      <h2 id="page-placeholder-title" className={styles.title}>
        구현 예정 콘텐츠
      </h2>
      <p className={styles.note}>
        이 영역은 공통 레이아웃 검토를 위한 임시 화면입니다. 아래 항목은 Phase 3에서 구현합니다.
      </p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
