import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Tabs.module.scss';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  panel: ReactNode;
}

export interface TabsProps<T extends string> {
  /** 탭 목록의 이름(예: "리소스 상세 정보") */
  label: string;
  items: TabItem<T>[];
  /** 선택한 탭. 상세 페이지처럼 URL(?tab=)과 동기화하기 위해 제어 컴포넌트로 둔다. */
  value: T;
  onChange: (value: T) => void;
}

/**
 * WAI-ARIA Tabs 패턴(자동 활성화)
 * - Tab 키: 탭 목록에는 선택된 탭 하나만 들어간다(로빙 tabindex). 다음 Tab은 패널로 이동한다.
 * - ←/→: 이전·다음 탭으로 이동하며 바로 선택한다. Home/End: 처음·마지막 탭.
 * - 탭 전환 시 초점은 선택한 탭에 머문다(패널로 옮기지 않는다, 설계서 8-1).
 */
export function Tabs<T extends string>({ label, items, value, onChange }: TabsProps<T>) {
  const baseId = useId();
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const tabId = (item: T) => `${baseId}-tab-${item}`;
  const panelId = (item: T) => `${baseId}-panel-${item}`;
  const selected = items.find((item) => item.value === value) ?? items[0];

  const select = (index: number) => {
    const next = items[(index + items.length) % items.length];
    if (!next) return;
    onChange(next.value);
    tabRefs.current.get(next.value)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const actions: Record<string, () => void> = {
      ArrowRight: () => {
        select(index + 1);
      },
      ArrowLeft: () => {
        select(index - 1);
      },
      Home: () => {
        select(0);
      },
      End: () => {
        select(items.length - 1);
      },
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.tablist}>
        {items.map((item, index) => {
          const isSelected = item.value === selected?.value;
          return (
            <button
              key={item.value}
              ref={(element) => {
                if (element) tabRefs.current.set(item.value, element);
                else tabRefs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={tabId(item.value)}
              aria-selected={isSelected}
              // 패널은 선택된 탭의 것만 렌더링하므로, 존재하는 패널만 가리킨다.
              aria-controls={isSelected ? panelId(item.value) : undefined}
              tabIndex={isSelected ? 0 : -1}
              className={cn(styles.tab, isSelected && styles.selected)}
              onClick={() => {
                onChange(item.value);
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, index);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {selected && (
        <div
          role="tabpanel"
          id={panelId(selected.value)}
          aria-labelledby={tabId(selected.value)}
          // 패널 안에 초점 가능한 요소가 없어도 Tab으로 패널에 도달할 수 있게 한다(APG 권장).
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- APG Tabs 패턴의 tabpanel 권장 사항
          tabIndex={0}
          className={styles.panel}
        >
          {selected.panel}
        </div>
      )}
    </div>
  );
}
