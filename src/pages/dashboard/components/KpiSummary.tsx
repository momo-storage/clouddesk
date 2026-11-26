import { CircleAlert, CircleCheck, CircleStop, Server, Wallet } from 'lucide-react';
import { Link } from 'react-router';

import { StatCard } from '@/components/data/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import type { AsyncValue } from '@/hooks/useAsyncValue';
import type { MonthlyCostSummary, ResourceSummary } from '@/services/dashboard';
import { formatMonth, formatNumber, formatUsd } from '@/utils/format';

import styles from '../DashboardPage.module.scss';

export interface KpiSummaryProps {
  summary: ResourceSummary | null;
  cost: AsyncValue<MonthlyCostSummary | null>;
}

function KpiSkeleton() {
  return (
    <div className={styles.kpiSkeleton}>
      <Skeleton width="40%" />
      <Skeleton width="55%" height={32} />
      <Skeleton width="70%" />
    </div>
  );
}

/** 오류 상태 리소스: 0대가 아니면 위험 색·아이콘·글자로 강조하고 오류 목록으로 바로 이동한다. */
function ErrorAlert({ count }: { count: number }) {
  if (count === 0) {
    return <p className={styles.kpiOk}>오류 상태 리소스 없음</p>;
  }
  return (
    <Link to="/resources?status=error" className={styles.kpiAlert}>
      <CircleAlert size={14} aria-hidden="true" />
      오류 상태 {count}대 확인 필요
    </Link>
  );
}

/** 요약 지표 4개: 전체·실행 중·중지됨 리소스, 이번 달 비용(설계서 3-2) */
export function KpiSummary({ summary, cost }: KpiSummaryProps) {
  const loading = summary === null || cost.status === 'loading';

  if (loading) {
    return (
      <div className={styles.kpis} aria-busy="true">
        <VisuallyHidden>요약 지표를 불러오는 중</VisuallyHidden>
        {Array.from({ length: 4 }, (_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </div>
    );
  }

  const { total, byStatus, byProvider } = summary;
  const percentOfTotal = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const costSummary = cost.status === 'ready' ? cost.data : null;

  return (
    <div className={styles.kpis}>
      <StatCard
        icon={Server}
        label="전체 리소스"
        value={formatNumber(total)}
        unit="대"
        detail={PROVIDER_KEYS.map(
          (provider) => `${PROVIDERS[provider].label} ${String(byProvider[provider].total)}`,
        ).join(' · ')}
        alert={<ErrorAlert count={byStatus.error} />}
        link={{ to: '/resources', label: '전체 리소스 보기' }}
      />
      <StatCard
        icon={CircleCheck}
        tone="success"
        label="실행 중"
        value={formatNumber(byStatus.running)}
        unit="대"
        detail={`전체의 ${String(percentOfTotal(byStatus.running))}% · 전환 중 ${String(byStatus.pending)}대`}
        link={{ to: '/resources?status=running', label: '실행 중 리소스 보기' }}
      />
      <StatCard
        icon={CircleStop}
        tone="neutral"
        label="중지됨"
        value={formatNumber(byStatus.stopped)}
        unit="대"
        detail={`전체의 ${String(percentOfTotal(byStatus.stopped))}% · 컴퓨팅 요금 미발생`}
        link={{ to: '/resources?status=stopped', label: '중지된 리소스 보기' }}
      />
      <StatCard
        icon={Wallet}
        label="이번 달 비용"
        value={costSummary ? formatUsd(costSummary.total) : '—'}
        change={
          costSummary?.changeRate != null
            ? { rate: costSummary.changeRate, label: '전월 대비' }
            : undefined
        }
        detail={
          costSummary
            ? `${formatMonth(costSummary.month)} 청구 기준 · USD`
            : '비용 데이터를 불러오지 못했습니다.'
        }
      />
    </div>
  );
}
