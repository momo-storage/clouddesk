import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/utils/cn';

import styles from './StatCard.module.scss';

export interface StatCardChange {
  /** 증감률(%). 0이면 변화 없음 */
  rate: number;
  /** 비교 기준 설명(예: "전월 대비") */
  label: string;
}

export interface StatCardProps {
  label: string;
  /** 표시할 값(서식 적용된 문자열) */
  value: string;
  /** 값 뒤에 붙는 단위(예: "대") */
  unit?: string;
  icon?: LucideIcon;
  /** 아이콘 상자의 색 의미 */
  tone?: 'primary' | 'success' | 'neutral';
  /** 보조 정보(예: 제공업체별 수) */
  detail?: ReactNode;
  change?: StatCardChange;
  /** 관리자가 바로 확인해야 할 내용(예: 오류 리소스). 보조 정보 아래에 강조해 보여준다. */
  alert?: ReactNode;
  /** 카드 하단의 목록 이동 링크. 링크 이름은 이동할 곳을 설명한다. */
  link?: { to: string; label: string };
}

/**
 * 요약 지표 카드. 위계: 라벨 → 핵심 수치 → 증감·보조 정보 → 강조 알림 → 이동 링크.
 * 증감은 화살표 + 부호 + 글자로 표시해 색에만 의존하지 않는다(설계서 6-3).
 * 비용 증감처럼 좋고 나쁨이 맥락에 따라 다른 값이라 증감에 색 의미(초록·빨강)를 두지 않는다.
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'primary',
  detail,
  change,
  alert,
  link,
}: StatCardProps) {
  const ChangeIcon =
    !change || change.rate === 0 ? ArrowRight : change.rate > 0 ? ArrowUpRight : ArrowDownRight;
  const sign = change && change.rate > 0 ? '+' : '';

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <span className={cn(styles.iconBox, styles[tone])} aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </p>
      {change && (
        <p className={styles.change}>
          <span className={styles.changeRate}>
            <ChangeIcon size={14} aria-hidden="true" />
            {sign}
            {change.rate.toFixed(1)}%
          </span>
          {change.label}
        </p>
      )}
      {detail && <p className={styles.detail}>{detail}</p>}
      {alert && <div className={styles.alert}>{alert}</div>}
      {link && (
        <Link to={link.to} className={styles.link}>
          {link.label}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
