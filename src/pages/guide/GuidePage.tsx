import { PageHeader } from '@/components/layout/PageHeader';

import { PaginationDemo, TableDemo } from './components/DataDemos';
import {
  BadgeDemo,
  EmptyStateDemo,
  SkeletonDemo,
  TabsDemo,
  TooltipDemo,
} from './components/DisplayDemos';
import {
  ButtonDemo,
  CheckboxDemo,
  InputDemo,
  RadioDemo,
  SelectDemo,
  SwitchDemo,
} from './components/FormDemos';
import { DropdownDemo, ModalDemo, ToastDemo } from './components/OverlayDemos';
import styles from './GuidePage.module.scss';

const SECTIONS = [
  { id: 'button', label: 'Button' },
  { id: 'input', label: 'Input' },
  { id: 'select', label: 'Select' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio' },
  { id: 'switch', label: 'Switch' },
  { id: 'badge', label: 'Badge' },
  { id: 'tooltip', label: 'Tooltip' },
  { id: 'modal', label: 'Modal' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'table', label: 'Table' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'toast', label: 'Toast' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'empty-state', label: 'Empty State' },
];

/**
 * 공통 UI 컴포넌트 확인 화면(Phase 2-4).
 * 실제 components/ui를 그대로 렌더링한다. 컴포넌트별 사용 지침, 키보드 동작 표, Typography·Color Palette 등
 * 최종 문서화는 Phase 3에서 진행한다.
 */
export function GuidePage() {
  return (
    <>
      <PageHeader
        title="UI 컴포넌트 가이드"
        description="CloudDesk 화면에서 쓰는 공통 UI 컴포넌트의 상태별 예시입니다."
      />
      <p className={styles.notice}>
        호버·초점 상태는 마우스와 키보드(Tab)로 직접 확인하세요. 사용 지침과 토큰 문서는 이후
        단계에서 추가합니다.
      </p>
      <nav aria-label="컴포넌트 목록" className={styles.toc}>
        <ul className={styles.tocList}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sections}>
        <ButtonDemo />
        <InputDemo />
        <SelectDemo />
        <CheckboxDemo />
        <RadioDemo />
        <SwitchDemo />
        <BadgeDemo />
        <TooltipDemo />
        <ModalDemo />
        <DropdownDemo />
        <TabsDemo />
        <TableDemo />
        <PaginationDemo />
        <ToastDemo />
        <SkeletonDemo />
        <EmptyStateDemo />
      </div>
    </>
  );
}
