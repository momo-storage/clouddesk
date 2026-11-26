import type { MouseEvent } from 'react';

import styles from './SkipLink.module.scss';

export interface SkipLinkProps {
  /** 본문 영역(main)의 id */
  targetId: string;
}

/**
 * 본문 바로가기. 페이지에서 처음 Tab을 누르면 나타난다.
 * 기본 해시 이동 대신 본문의 h1로 초점을 옮긴다. 주소에 #이 붙지 않고, 화면 낭독기가 페이지 제목부터 읽는다.
 */
export function SkipLink({ targetId }: SkipLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    const heading = target.querySelector<HTMLElement>('h1[tabindex="-1"]');
    (heading ?? target).focus();
  };

  return (
    <a href={`#${targetId}`} className={styles.skipLink} onClick={handleClick}>
      본문 바로가기
    </a>
  );
}
