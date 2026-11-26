import { PagePlaceholder } from '@/components/layout/PagePlaceholder';
import { PageHeader } from '@/components/layout/PageHeader';

export function ResourceListPage() {
  return (
    <>
      <PageHeader
        title="리소스 관리"
        description="클라우드 제공업체별 가상 서버를 검색하고 등록·수정·삭제합니다."
      />
      <PagePlaceholder
        items={[
          '키워드 검색, 제공업체·상태 필터',
          '정렬·다중 선택·페이지네이션 테이블',
          '리소스 등록·수정 모달',
          '삭제 확인 모달',
          '데이터 없음·검색 결과 없음·로딩 상태',
        ]}
      />
    </>
  );
}
