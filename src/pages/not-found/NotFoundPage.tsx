import { LayoutDashboard } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { HOME_PATH } from '@/constants/navigation';

import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="페이지를 찾을 수 없습니다"
        description="주소가 잘못되었거나 더 이상 제공하지 않는 페이지입니다."
      />
      <div className={styles.panel}>
        <p>주소를 다시 확인하거나 대시보드에서 원하는 메뉴로 이동하세요.</p>
        <ButtonLink to={HOME_PATH} variant="primary" icon={LayoutDashboard}>
          대시보드로 이동
        </ButtonLink>
      </div>
    </>
  );
}
