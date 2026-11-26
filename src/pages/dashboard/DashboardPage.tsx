import { PagePlaceholder } from '@/components/layout/PagePlaceholder';
import { PageHeader } from '@/components/layout/PageHeader';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="AWS, Azure, GCP 리소스와 비용 현황을 한 화면에서 확인합니다."
      />
      <PagePlaceholder
        items={[
          '요약 지표 4개(전체·실행 중·중지 리소스, 이번 달 비용)',
          'CPU·메모리 사용량 차트',
          '제공업체별 리소스 현황',
          '월별 비용 추이',
          '최근 알림 및 이벤트',
          '주요 리소스 상태',
        ]}
      />
    </>
  );
}
