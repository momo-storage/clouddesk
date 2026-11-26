import { useParams } from 'react-router';

import { PagePlaceholder } from '@/components/layout/PagePlaceholder';
import { PageHeader } from '@/components/layout/PageHeader';

export function ResourceDetailPage() {
  const { resourceId = '' } = useParams();

  // Phase 2-5에서 Mock 데이터가 생기면 리소스 이름을 제목으로 쓰고, 없는 ID는 "리소스를 찾을 수 없음" 상태로 처리한다.
  return (
    <>
      <PageHeader title={resourceId} description="리소스 상세 정보" />
      <PagePlaceholder
        items={[
          '탭: 개요, 모니터링, 네트워크, 이벤트 로그',
          '기본 정보와 인스턴스 상태',
          'CPU·메모리·디스크 사용량',
          '수정·삭제 액션',
        ]}
      />
    </>
  );
}
