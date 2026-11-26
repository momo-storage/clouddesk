import { Skeleton } from '@/components/ui/Skeleton';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';

/** 차트 영역 로딩 상태. 영역에 aria-busy와 숨김 텍스트를 두고 모양은 낭독기에서 숨긴다. */
export function ChartSkeleton({ label, height = 240 }: { label: string; height?: number }) {
  return (
    <div aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      <Skeleton width="85%" />
      <Skeleton width="30%" />
      <Skeleton variant="block" height={height} />
    </div>
  );
}
