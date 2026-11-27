import { CircleDollarSign, Server } from 'lucide-react';

import { StatCard } from '@/components/data/StatCard';
import { Panel } from '@/components/layout/Panel';
import { Button } from '@/components/ui/Button';
import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/ui/Table';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';
import { useDemoAction } from './useDemoAction';

export function PanelDemo() {
  const demo = useDemoAction();

  return (
    <GuideSection id="panel" title="Panel">
      <GuideExample label="기본: 제목 · 설명 · 오른쪽 액션">
        <div className={styles.fullWidth}>
          <Panel
            title="현재 사용률"
            description="모니터링 기준 시각의 값"
            actions={
              <Button size="sm" variant="ghost" onClick={demo('전체 보기')}>
                전체 보기
              </Button>
            }
          >
            <p className={styles.mutedText}>본문 영역은 안쪽 여백을 가진다.</p>
          </Panel>
        </div>
      </GuideExample>
      <GuideExample label="flush: 표를 가장자리까지 채움(위쪽 구분선)">
        <div className={styles.fullWidth}>
          <Panel title="최근 이벤트" description="최신 2건" flush>
            <Table caption="최근 이벤트(예시)" hideCaption className={styles.flushTable}>
              <thead>
                <tr>
                  <TableHeaderCell>발생 시각</TableHeaderCell>
                  <TableHeaderCell>내용</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                <TableRow>
                  <TableCell className={styles.nowrap}>2026-11-26 08:40</TableCell>
                  <TableCell>리소스 정보가 수정되었습니다.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={styles.nowrap}>2026-11-26 07:15</TableCell>
                  <TableCell>CPU 사용률이 경고 임계치를 넘었습니다.</TableCell>
                </TableRow>
              </tbody>
            </Table>
          </Panel>
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function StatCardDemo() {
  return (
    <GuideSection id="stat-card" title="StatCard">
      <GuideExample label="보조 정보 · 알림 · 이동 링크">
        <div className={styles.fullWidth}>
          <StatCard
            label="전체 리소스"
            value="80"
            unit="대"
            icon={Server}
            detail="AWS 34 · Azure 24 · GCP 22"
            alert={<span className={styles.dangerText}>오류 상태 4대 확인 필요</span>}
            link={{ to: '/resources', label: '전체 리소스 보기' }}
          />
        </div>
      </GuideExample>
      <GuideExample label="증감(화살표 + 부호 + 글자)">
        <div className={styles.fullWidth}>
          <StatCard
            label="이번 달 비용"
            value="$10,857.17"
            icon={CircleDollarSign}
            tone="neutral"
            change={{ rate: 4.2, label: '전월 대비' }}
          />
        </div>
      </GuideExample>
      <GuideExample label="감소 · success 아이콘 색">
        <div className={styles.fullWidth}>
          <StatCard
            label="중지됨"
            value="12"
            unit="대"
            icon={Server}
            tone="success"
            change={{ rate: -8.3, label: '지난주 대비' }}
          />
        </div>
      </GuideExample>
    </GuideSection>
  );
}
