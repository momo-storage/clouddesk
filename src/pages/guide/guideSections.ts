/**
 * 가이드 목차와 컴포넌트 설명의 단일 원천. 분류 → 컴포넌트 순서로 화면과 목차가 같은 구성을 쓴다.
 * id는 각 예시 영역(GuideSection)의 앵커다.
 */
export interface GuideSectionInfo {
  id: string;
  label: string;
  description: string;
}

export interface GuideGroupInfo {
  id: string;
  label: string;
  description: string;
  sections: GuideSectionInfo[];
}

export const GUIDE_GROUPS: GuideGroupInfo[] = [
  {
    id: 'group-actions',
    label: '입력·액션',
    description: '등록·수정 폼, 필터, 페이지 상단 액션에 쓰는 입력 요소와 버튼',
    sections: [
      {
        id: 'button',
        label: 'Button',
        description: '실행 버튼. 주요·보조·고스트·위험 4종과 처리 중 상태',
      },
      {
        id: 'input',
        label: 'Input',
        description: '텍스트 입력. 라벨·도움말·오류 문구를 입력란에 연결',
      },
      { id: 'select', label: 'Select', description: '네이티브 선택 상자. 필터와 폼에서 사용' },
      {
        id: 'checkbox',
        label: 'Checkbox',
        description: '다중 선택. 표의 행 선택과 전체 선택(혼합 상태)',
      },
      { id: 'radio', label: 'Radio', description: '하나만 고르는 선택. 모니터링 조회 기간 등' },
      { id: 'switch', label: 'Switch', description: '켜기/끄기 설정. 모니터링 수집 여부 등' },
    ],
  },
  {
    id: 'group-display',
    label: '상태 표시',
    description: '목록·상세·대시보드에서 상태와 수치를 짧게 보여주는 요소',
    sections: [
      { id: 'badge', label: 'Badge', description: '짧은 분류·상태 표시의 기본형' },
      {
        id: 'status-badge',
        label: 'StatusBadge · SeverityBadge',
        description: '리소스 상태와 이벤트 심각도를 아이콘 + 글자로 표시',
      },
      {
        id: 'usage-bar',
        label: 'UsageBar',
        description: '사용률 숫자 + 막대 + 임계치(경고 70%, 위험 90%). 표용 기본형과 카드용 full',
      },
      { id: 'tooltip', label: 'Tooltip', description: '아이콘 버튼 이름이나 짧은 보충 설명' },
      { id: 'skeleton', label: 'Skeleton', description: '데이터를 불러오는 동안의 자리 표시' },
      {
        id: 'empty-state',
        label: 'Empty State',
        description: '데이터 없음·검색 결과 없음과 다음 행동 안내',
      },
    ],
  },
  {
    id: 'group-overlay',
    label: '오버레이·알림',
    description: '화면 위에 떠서 확인·선택·결과를 전달하는 요소',
    sections: [
      { id: 'modal', label: 'Modal', description: '등록·수정 폼과 삭제 확인(ConfirmModal)' },
      {
        id: 'dropdown',
        label: 'Dropdown',
        description: '헤더 사용자 메뉴처럼 몇 개의 링크·명령 묶음',
      },
      { id: 'toast', label: 'Toast', description: '저장·삭제 등 처리 결과 알림' },
    ],
  },
  {
    id: 'group-navigation',
    label: '탐색',
    description: '같은 화면 안에서 영역이나 페이지를 바꾸는 요소',
    sections: [
      {
        id: 'tabs',
        label: 'Tabs',
        description: '리소스 상세의 개요·모니터링·네트워크·이벤트 로그 전환',
      },
      { id: 'pagination', label: 'Pagination', description: '표의 페이지 이동' },
    ],
  },
  {
    id: 'group-layout',
    label: '레이아웃',
    description: '화면의 정보 영역과 요약 지표를 구성하는 틀',
    sections: [
      {
        id: 'panel',
        label: 'Panel',
        description: '제목·설명·액션이 있는 정보 영역. 표를 가장자리까지 채우는 flush 형태 포함',
      },
      {
        id: 'stat-card',
        label: 'StatCard',
        description: '대시보드 요약 지표. 수치·증감·보조 정보·알림·이동 링크',
      },
    ],
  },
  {
    id: 'group-data',
    label: '데이터 표',
    description: '업무 목록을 보여주고 검색·정렬·선택·페이지 이동을 하는 표',
    sections: [
      {
        id: 'data-table',
        label: 'DataTable · FilterBar',
        description:
          '리소스 목록에서 쓰는 표(정렬·선택·페이지 크기·고정 열·로딩·빈 상태)와 검색·필터 영역',
      },
      {
        id: 'table',
        label: 'Table (기본 요소)',
        description:
          'DataTable이 쓰는 표 기본 요소. 정렬·선택이 필요 없는 작은 표(최근 이벤트, 보안 규칙)에 직접 사용',
      },
    ],
  },
  {
    id: 'group-chart',
    label: '차트',
    description: '시계열·항목별 수치를 그리고, 같은 정보를 요약 문장과 데이터 표로도 제공',
    sections: [
      {
        id: 'metric-chart',
        label: 'MetricChart',
        description: '사용률 시계열 선 차트. 경고·위험 기준선',
      },
      {
        id: 'category-bar-chart',
        label: 'CategoryBarChart',
        description: '항목별 누적 막대(가로·세로)',
      },
      {
        id: 'chart-parts',
        label: '차트 공통 요소',
        description:
          'ChartLegend·ChartTooltip·ChartDataTable·ChartSkeleton. 차트 안에서 함께 쓰인다',
      },
    ],
  },
];

const SECTION_DESCRIPTION = new Map(
  GUIDE_GROUPS.flatMap((group) =>
    group.sections.map((section) => [section.id, section.description]),
  ),
);

export function getSectionDescription(id: string): string | undefined {
  return SECTION_DESCRIPTION.get(id);
}
