import { RotateCcw, Search } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

import styles from './FilterBar.module.scss';

export interface FilterBarProps {
  /** 검색 영역의 이름(form role="search") */
  label: string;
  /** 현재 적용된 검색어 */
  keyword: string;
  /** 검색어 입력란 라벨과 안내 문구 */
  keywordLabel: string;
  keywordPlaceholder?: string;
  /** Enter 또는 검색 버튼으로 검색어를 적용한다. */
  onSearch: (keyword: string) => void;
  /** 필터 선택 상자들 */
  children?: ReactNode;
  /** 검색어·필터를 모두 지운다. */
  onReset: () => void;
  /** 적용된 조건이 있을 때만 초기화할 수 있다. */
  canReset: boolean;
  className?: string;
}

/**
 * 검색어 + 필터 + 초기화(설계서 6-3).
 * 검색어는 입력할 때마다 결과가 바뀌면 화면 낭독기 사용자가 혼란하므로 Enter·검색 버튼으로만 적용한다.
 * 필터 선택 상자는 고르는 즉시 적용한다(결과 건수는 사용처가 role="status"로 알린다).
 */
export function FilterBar({
  label,
  keyword,
  keywordLabel,
  keywordPlaceholder,
  onSearch,
  children,
  onReset,
  canReset,
  className,
}: FilterBarProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(keyword);
  const [appliedKeyword, setAppliedKeyword] = useState(keyword);

  // 적용된 검색어가 밖에서 바뀌면(초기화, 주소로 이동) 입력란도 맞춘다. 렌더링 중 조정하는 React 권장 방식이다.
  if (keyword !== appliedKeyword) {
    setAppliedKeyword(keyword);
    setDraft(keyword);
  }

  return (
    <form
      role="search"
      aria-label={label}
      className={cn(styles.filterBar, className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft.trim());
      }}
    >
      <div className={styles.keyword}>
        <Input
          id={inputId}
          type="search"
          label={keywordLabel}
          placeholder={keywordPlaceholder}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          fieldClassName={styles.keywordField}
        />
        <Button type="submit" icon={Search} className={styles.searchButton}>
          검색
        </Button>
      </div>
      {children && <div className={styles.filters}>{children}</div>}
      <Button
        variant="ghost"
        icon={RotateCcw}
        className={styles.resetButton}
        // 누른 뒤 비활성으로 바뀌어도 초점을 잃지 않도록 disabled 대신 aria-disabled를 쓴다.
        aria-disabled={!canReset || undefined}
        onClick={() => {
          setDraft('');
          onReset();
        }}
      >
        조건 초기화
      </Button>
    </form>
  );
}
