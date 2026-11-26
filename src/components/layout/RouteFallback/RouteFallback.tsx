import styles from './RouteFallback.module.scss';

/**
 * 첫 화면이 지연 로딩 라우트(대시보드 등)일 때, 화면 코드를 내려받는 짧은 동안 보여주는 상태.
 * React Router가 첫 이동을 마치기 전에 렌더링한다.
 */
export function RouteFallback() {
  return (
    <p className={styles.fallback} role="status">
      CloudDesk 화면을 불러오는 중입니다.
    </p>
  );
}
