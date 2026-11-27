import type { ReactNode } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';

import { CategoryBarChartDemo, ChartPartsDemo, MetricChartDemo } from './components/ChartDemos';
import { PaginationDemo, TableDemo } from './components/DataDemos';
import { DataTableDemo } from './components/DataTableDemo';
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
import { GuideGroup } from './components/GuideSection';
import { PanelDemo, StatCardDemo } from './components/LayoutDemos';
import { DropdownDemo, ModalDemo, ToastDemo } from './components/OverlayDemos';
import { StatusBadgeDemo, UsageBarDemo } from './components/StatusDemos';
import styles from './GuidePage.module.scss';
import { GUIDE_GROUPS } from './guideSections';

/** 분류 id → 그 분류에 속한 예시 영역(목차와 같은 순서) */
const GROUP_CONTENT: Record<string, ReactNode> = {
  'group-actions': (
    <>
      <ButtonDemo />
      <InputDemo />
      <SelectDemo />
      <CheckboxDemo />
      <RadioDemo />
      <SwitchDemo />
    </>
  ),
  'group-display': (
    <>
      <BadgeDemo />
      <StatusBadgeDemo />
      <UsageBarDemo />
      <TooltipDemo />
      <SkeletonDemo />
      <EmptyStateDemo />
    </>
  ),
  'group-overlay': (
    <>
      <ModalDemo />
      <DropdownDemo />
      <ToastDemo />
    </>
  ),
  'group-navigation': (
    <>
      <TabsDemo />
      <PaginationDemo />
    </>
  ),
  'group-layout': (
    <>
      <PanelDemo />
      <StatCardDemo />
    </>
  ),
  'group-data': (
    <>
      <DataTableDemo />
      <TableDemo />
    </>
  ),
  'group-chart': (
    <>
      <MetricChartDemo />
      <CategoryBarChartDemo />
      <ChartPartsDemo />
    </>
  ),
};

/**
 * UI 컴포넌트 가이드. 업무 화면이 쓰는 공통 컴포넌트(components/ui·layout·data·charts)를 그대로 렌더링한다.
 * 가이드 전용 컴포넌트는 만들지 않고, 예시 데이터가 필요하면 실제 데모 데이터를 읽기만 한다.
 */
export function GuidePage() {
  return (
    <>
      <PageHeader
        title="UI 컴포넌트 가이드"
        description="CloudDesk 업무 화면에서 쓰는 공통 컴포넌트를 분류별로 모았습니다. 예시는 실제 컴포넌트로 동작합니다."
      />
      <p className={styles.notice}>
        호버·초점 상태는 마우스와 키보드(Tab)로 직접 확인하세요. 예시 버튼은 누르면 알림만 띄우며
        데모 데이터를 바꾸지 않습니다.
      </p>
      <nav aria-label="컴포넌트 목록" className={styles.toc}>
        {GUIDE_GROUPS.map((group) => (
          <div key={group.id} className={styles.tocGroup}>
            <a href={`#${group.id}`} className={styles.tocGroupLink}>
              {group.label}
            </a>
            <ul className={styles.tocList}>
              {group.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className={styles.groups}>
        {GUIDE_GROUPS.map((group) => (
          <GuideGroup
            key={group.id}
            id={group.id}
            title={group.label}
            description={group.description}
          >
            {GROUP_CONTENT[group.id]}
          </GuideGroup>
        ))}
      </div>
    </>
  );
}
