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

function toParts(iso: string): Record<string, string> {
  return Object.fromEntries(
    dateTimeParts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
}

/** YYYY-MM-DD HH:mm */
export function formatDateTime(iso: string): string {
  const parts = toParts(iso);
  return `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''} ${parts.hour ?? ''}:${parts.minute ?? ''}`;
}

/** HH:mm (차트 시간축) */
export function formatTime(iso: string): string {
  const parts = toParts(iso);
  return `${parts.hour ?? ''}:${parts.minute ?? ''}`;
}

/** MM-DD (7일처럼 여러 날에 걸친 차트의 시간축) */
export function formatMonthDay(iso: string): string {
  const parts = toParts(iso);
  return `${parts.month ?? ''}-${parts.day ?? ''}`;
}

/** YYYY-MM → "2026년 11월" (짧게: "11월") */
export function formatMonth(month: string, short = false): string {
  const [year = '', monthNumber = ''] = month.split('-');
  return short ? `${String(Number(monthNumber))}월` : `${year}년 ${String(Number(monthNumber))}월`;
}

const integerFormat = new Intl.NumberFormat('ko-KR');
const percentFormat = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usdCompactFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** 천 단위 구분 정수 */
export function formatNumber(value: number): string {
  return integerFormat.format(value);
}

/** 소수점 1자리 퍼센트 값(기호 없이). 단위는 열 머리글·라벨에 표기한다(설계서 7-4). */
export function formatPercent(value: number): string {
  return percentFormat.format(value);
}

/** USD 소수점 2자리(예: $10,857.17) */
export function formatUsd(value: number): string {
  return usdFormat.format(value);
}

/** 차트 축용 USD 정수(예: $4,720) */
export function formatUsdCompact(value: number): string {
  return usdCompactFormat.format(value);
}
