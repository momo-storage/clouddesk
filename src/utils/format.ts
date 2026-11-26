/**
 * 날짜·숫자 표시 형식. Intl 포맷터를 한곳에서 만들어 화면마다 형식이 달라지지 않게 한다(설계서 7-4).
 * 시각은 모두 한국 시간(KST)으로 표시한다.
 */
const dateTimeParts = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** YYYY-MM-DD HH:mm */
export function formatDateTime(iso: string): string {
  const parts = Object.fromEntries(
    dateTimeParts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''} ${parts.hour ?? ''}:${parts.minute ?? ''}`;
}
