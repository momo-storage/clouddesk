import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 폰트 → 전역 스타일 순서로 불러온다.
// Pretendard는 npm 패키지의 다이내믹 서브셋을 번들에 포함해 같은 도메인에서 제공한다(외부 CDN 미사용).
// 화면에 쓰인 글자가 속한 서브셋 woff2만 내려받는다(unicode-range).
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@/styles/global.scss';

import { App } from '@/app/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root 요소를 찾을 수 없습니다. index.html을 확인하세요.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
