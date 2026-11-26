import type { ThresholdLevel } from '@/types/metric';

/** 사용률 임계치(%): 정상 < 70 ≤ 경고 < 90 ≤ 위험 (설계서 3-3) */
export const USAGE_THRESHOLD = {
  warning: 70,
  critical: 90,
} as const;

export const THRESHOLD_LABEL: Record<ThresholdLevel, string> = {
  normal: '정상',
  warning: '경고',
  critical: '위험',
};

export function getThresholdLevel(usage: number): ThresholdLevel {
  if (usage >= USAGE_THRESHOLD.critical) return 'critical';
  if (usage >= USAGE_THRESHOLD.warning) return 'warning';
  return 'normal';
}
