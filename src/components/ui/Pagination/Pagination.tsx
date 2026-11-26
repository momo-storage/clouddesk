import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { cn } from '@/utils/cn';

import { getPageItems } from './getPageItems';
import styles from './Pagination.module.scss';

export interface PaginationProps {
  /** 현재 페이지(1부터) */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** 같은 화면에 페이지네이션이 여러 개일 때 구분할 이름 */
  label?: string;
  className?: string;
}

/**
 * 페이지 이동. nav + 버튼 목록, 현재 페이지는 aria-current="page".
 * 이전/다음 버튼을 눌러 끝 페이지에 닿으면 그 버튼이 비활성화되어 초점이 사라지므로,
 * 이때는 현재 페이지 번호 버튼으로 초점을 옮긴다(설계서 8-1).
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = '페이지',
  className,
}: PaginationProps) {
  const navRef = useRef<HTMLElement>(null);
  const moveFocusToCurrent = useRef(false);

  useEffect(() => {
    if (!moveFocusToCurrent.current) return;
    moveFocusToCurrent.current = false;
    navRef.current?.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus();
  }, [page]);

  if (pageCount <= 1) return null;

  const goTo = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), pageCount);
    if (clamped === page) return;
    // 누른 이전/다음 버튼이 다음 렌더링에서 비활성화될 경우에만 초점을 옮긴다.
    moveFocusToCurrent.current = clamped === 1 || clamped === pageCount;
    onPageChange(clamped);
  };

  return (
    <nav ref={navRef} aria-label={label} className={cn(styles.pagination, className)}>
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={cn(styles.button, styles.arrow)}
            disabled={page <= 1}
            onClick={() => {
              goTo(page - 1);
            }}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <VisuallyHidden>이전 페이지</VisuallyHidden>
          </button>
        </li>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={cn(styles.button, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => {
                  moveFocusToCurrent.current = false;
                  onPageChange(item);
                }}
              >
                {item}
                <VisuallyHidden>페이지</VisuallyHidden>
              </button>
            </li>
          ) : (
            <li key={item} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={cn(styles.button, styles.arrow)}
            disabled={page >= pageCount}
            onClick={() => {
              goTo(page + 1);
            }}
          >
            <ChevronRight size={16} aria-hidden="true" />
            <VisuallyHidden>다음 페이지</VisuallyHidden>
          </button>
        </li>
      </ul>
    </nav>
  );
}
