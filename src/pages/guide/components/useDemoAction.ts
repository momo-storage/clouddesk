import { useToast } from '@/store/toast/toastContext';

/**
 * 가이드 예시 버튼이 아무 반응 없는 더미가 되지 않도록, 누르면 어떤 버튼이 실행됐는지 알림으로 보여준다.
 */
export function useDemoAction() {
  const { showToast } = useToast();
  return (label: string) => () => {
    showToast(`"${label}" 버튼을 눌렀습니다. (가이드 예시)`, 'info');
  };
}
