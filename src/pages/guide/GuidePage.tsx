import { PagePlaceholder } from '@/components/layout/PagePlaceholder';
import { PageHeader } from '@/components/layout/PageHeader';

export function GuidePage() {
  return (
    <>
      <PageHeader
        title="UI 컴포넌트 가이드"
        description="CloudDesk에서 쓰는 디자인 토큰과 공통 UI 컴포넌트의 상태별 예시입니다."
      />
      <PagePlaceholder
        items={[
          'Typography, Color Palette(대비 포함)',
          'Button, Input, Select, Checkbox, Radio, Switch',
          'Badge, Tooltip, Modal, Dropdown, Tabs',
          'Table, Pagination, Toast, Skeleton, Empty State',
        ]}
      />
    </>
  );
}
