/** 화면 가장자리와 떠 있는 요소 사이 최소 간격(px). --space-2와 같은 값 */
const VIEWPORT_MARGIN = 8;

/**
 * 떠 있는 요소(Tooltip, Dropdown 패널)가 화면 가로 밖으로 나가면 안쪽으로 밀어 넣는다.
 * 위치 계산 라이브러리 없이 translate만 조정하며, 요소가 보이는 상태에서 호출한다.
 * 스크롤 영역(overflow)에 의한 잘림은 해결하지 않으므로 사용 위치에서 피한다(설계서 6-4).
 */
export function keepInViewportX(element: HTMLElement): void {
  element.style.translate = '';
  const { left, right } = element.getBoundingClientRect();
  const viewportRight = document.documentElement.clientWidth - VIEWPORT_MARGIN;
  const shift =
    left < VIEWPORT_MARGIN
      ? VIEWPORT_MARGIN - left
      : right > viewportRight
        ? viewportRight - right
        : 0;
  if (shift !== 0) element.style.translate = `${String(shift)}px 0`;
}
