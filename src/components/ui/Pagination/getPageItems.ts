export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

/**
 * 표시할 페이지 번호 목록. 처음·마지막 페이지와 현재 페이지 앞뒤 1개를 보여주고 나머지는 줄임표로 줄인다.
 * 항목 수를 최대 7개로 고정해 페이지를 옮겨도 버튼 위치가 크게 흔들리지 않게 한다.
 * 예) 현재 6 / 전체 20 → 1 … 5 6 7 … 20
 */
export function getPageItems(page: number, pageCount: number): PageItem[] {
  const MAX_ITEMS = 7;
  if (pageCount <= MAX_ITEMS) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index);

  if (page <= 4) return [...range(1, 5), 'end-ellipsis', pageCount];
  if (page >= pageCount - 3) return [1, 'start-ellipsis', ...range(pageCount - 4, pageCount)];
  return [1, 'start-ellipsis', page - 1, page, page + 1, 'end-ellipsis', pageCount];
}
