import {
  CircleAlert,
  CircleCheck,
  CircleStop,
  Info,
  LoaderCircle,
  Plus,
  RotateCcw,
  SearchX,
  Server,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';
import { useDemoAction } from './useDemoAction';

export function BadgeDemo() {
  return (
    <GuideSection id="badge" title="Badge">
      <GuideExample label="상태 (아이콘 + 텍스트)" wide>
        <Badge tone="success" icon={CircleCheck}>
          실행 중
        </Badge>
        <Badge tone="neutral" icon={CircleStop}>
          중지됨
        </Badge>
        <Badge tone="warning" icon={LoaderCircle}>
          전환 중
        </Badge>
        <Badge tone="danger" icon={CircleAlert}>
          오류
        </Badge>
        <Badge tone="info" icon={Info}>
          정보
        </Badge>
      </GuideExample>
      <GuideExample label="분류 (제공업체·역할)" wide>
        <Badge>AWS</Badge>
        <Badge>Azure</Badge>
        <Badge>GCP</Badge>
        <Badge tone="info">관리자</Badge>
      </GuideExample>
    </GuideSection>
  );
}

export function TooltipDemo() {
  const demo = useDemoAction();
  return (
    <GuideSection id="tooltip" title="Tooltip">
      <GuideExample label="설명 툴팁 (호버·초점, ESC로 숨김)">
        <Tooltip content="마지막 동기화: 5분 전. 클라우드 제공업체 API에서 리소스 상태와 사용률을 다시 가져옵니다.">
          <Button icon={RotateCcw} onClick={demo('동기화')}>
            동기화
          </Button>
        </Tooltip>
      </GuideExample>
      <GuideExample label="아이콘 단독 버튼의 이름 표시">
        <Tooltip content="설정" kind="label" placement="bottom">
          <Button variant="ghost" iconOnly icon={Settings} onClick={demo('설정')}>
            설정
          </Button>
        </Tooltip>
      </GuideExample>
    </GuideSection>
  );
}

type DemoTab = 'overview' | 'network' | 'events';

export function TabsDemo() {
  const [tab, setTab] = useState<DemoTab>('overview');

  return (
    <GuideSection id="tabs" title="Tabs">
      <GuideExample label="←/→, Home/End로 이동하며 바로 선택" wide>
        <div className={styles.fullWidth}>
          <Tabs
            label="리소스 상세 정보"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'overview', label: '개요', panel: <p>기본 정보와 사용률 요약 영역</p> },
              { value: 'network', label: '네트워크', panel: <p>VPC, 서브넷, 보안 그룹 영역</p> },
              { value: 'events', label: '이벤트 로그', panel: <p>최근 이벤트 목록 영역</p> },
            ]}
          />
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function SkeletonDemo() {
  return (
    <GuideSection id="skeleton" title="Skeleton">
      <GuideExample label="텍스트 · 영역 (영역에 aria-busy와 숨김 텍스트)" wide>
        <div className={styles.loadingArea} aria-busy="true">
          <VisuallyHidden>불러오는 중</VisuallyHidden>
          <Skeleton width="40%" />
          <Skeleton width="70%" />
          <Skeleton variant="block" height={80} />
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function EmptyStateDemo() {
  const demo = useDemoAction();
  return (
    <GuideSection id="empty-state" title="Empty State">
      <GuideExample label="데이터 없음">
        <div className={styles.panelBox}>
          <EmptyState
            icon={Server}
            headingLevel={3}
            title="등록된 리소스가 없습니다"
            description="첫 번째 가상 서버 리소스를 등록해 관리를 시작하세요."
            action={
              <Button variant="primary" icon={Plus} onClick={demo('리소스 등록')}>
                리소스 등록
              </Button>
            }
          />
        </div>
      </GuideExample>
      <GuideExample label="검색 결과 없음">
        <div className={styles.panelBox}>
          <EmptyState
            icon={SearchX}
            headingLevel={3}
            title="검색 결과가 없습니다"
            description="검색어나 필터 조건을 바꿔 다시 검색하세요."
            action={
              <Button icon={RotateCcw} onClick={demo('조건 초기화')}>
                조건 초기화
              </Button>
            }
          />
        </div>
      </GuideExample>
    </GuideSection>
  );
}
