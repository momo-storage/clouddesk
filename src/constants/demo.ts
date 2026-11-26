/**
 * 데모 데이터의 기준 시각(KST 2026-11-26 09:00).
 * 시드 데이터의 생성일·이벤트 시각·모니터링 시계열·비용 월은 모두 이 시각을 기준으로 만든다.
 * 현재 시각을 쓰면 새로고침할 때마다 데이터가 바뀌므로 고정한다.
 * 사용자가 등록·수정·삭제할 때 생기는 데이터만 실제 현재 시각을 쓴다.
 */
export const DEMO_REFERENCE_TIME = '2026-11-26T09:00:00+09:00';

/** localStorage 키. 데이터 구조가 바뀌면 버전을 올려 이전 데이터를 버리고 시드로 다시 시작한다. */
export const DEMO_STORAGE_KEY = 'clouddesk:data';
export const DEMO_STORAGE_VERSION = 1;

/** Mock 서비스 응답 지연(ms). 로딩 상태가 실제 흐름처럼 보이도록 한다(설계서 3-1). */
export const MOCK_DELAY_RANGE = { min: 300, max: 600 } as const;
