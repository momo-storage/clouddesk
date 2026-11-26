import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { useRouteCrumbs } from '@/app/routeMeta';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Header } from '@/components/layout/Header';
import { MobileNav, Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/layout/SkipLink';
import { maxWidthQuery } from '@/constants/breakpoints';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import styles from './AppLayout.module.scss';

const SERVICE_NAME = 'CloudDesk';
const MAIN_ID = 'main-content';
const SIDEBAR_STORAGE_KEY = 'clouddesk:sidebar';

/** 사용자가 직접 고른 사이드바 상태. null이면 화면 폭에 따른 기본값을 쓴다. */
type SidebarPreference = 'expanded' | 'collapsed' | null;

function isSidebarPreference(value: unknown): value is SidebarPreference {
  return value === 'expanded' || value === 'collapsed' || value === null;
}

/**
 * 라우트 전환 시 문서 제목을 바꾸고 h1로 초점을 옮긴다(설계서 8-1).
 * - pathname이 바뀔 때만 동작한다. 같은 경로의 쿼리 변경(검색, 필터, 정렬, 페이지, ?tab=)에는 초점을 옮기지 않는다.
 * - 최초 로드에는 초점을 옮기지 않는다. 첫 Tab에서 본문 바로가기가 나와야 하기 때문이다.
 */
function useRouteFocusAndTitle(mainRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();
  const crumbs = useRouteCrumbs();
  const pageTitle = crumbs.at(-1)?.label;
  // 직전 pathname과 비교한다. StrictMode의 effect 재실행이나 최초 로드에서는 값이 같아 초점을 옮기지 않는다.
  const previousPathname = useRef(pathname);

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${SERVICE_NAME}` : SERVICE_NAME;
  }, [pageTitle]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const main = mainRef.current;
    const heading = main?.querySelector<HTMLElement>('h1[tabindex="-1"]');
    (heading ?? main)?.focus();
  }, [pathname, mainRef]);
}

/**
 * 공통 레이아웃: 헤더 + 사이드바 + 본문.
 *
 * 사이드바 모드
 * - 1280px 이상: 기본 펼침(240px)
 * - 1024~1279px: 기본 접힘(56px, 아이콘 + 툴팁)
 * - 1023px 이하: 사이드바를 숨기고 헤더 메뉴 버튼으로 서랍(dialog)을 연다
 * 사용자가 접기/펼치기를 누르면 그 선택을 localStorage에 저장해 폭과 관계없이 유지한다.
 */
export function AppLayout() {
  const isDrawerMode = useMediaQuery(maxWidthQuery('md'));
  const isCompactWidth = useMediaQuery(maxWidthQuery('lg'));
  const [sidebarPreference, setSidebarPreference] = useLocalStorage<SidebarPreference>(
    SIDEBAR_STORAGE_KEY,
    null,
    isSidebarPreference,
  );
  const collapsed = sidebarPreference === null ? isCompactWidth : sidebarPreference === 'collapsed';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useRouteFocusAndTitle(mainRef);

  // 서랍이 열린 채로 데스크톱 폭이 되면 서랍 컴포넌트가 사라지므로 상태도 닫힘으로 맞춘다.
  if (!isDrawerMode && drawerOpen) {
    setDrawerOpen(false);
  }

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <div className={styles.app}>
      <SkipLink targetId={MAIN_ID} />
      <Header
        showMenuButton={isDrawerMode}
        menuOpen={drawerOpen}
        onMenuClick={() => {
          setDrawerOpen(true);
        }}
        menuButtonRef={menuButtonRef}
      />
      <div className={styles.body}>
        {!isDrawerMode && (
          <Sidebar
            collapsed={collapsed}
            onToggle={() => {
              setSidebarPreference(collapsed ? 'expanded' : 'collapsed');
            }}
          />
        )}
        <main ref={mainRef} id={MAIN_ID} tabIndex={-1} className={styles.main}>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
      {isDrawerMode && (
        <MobileNav open={drawerOpen} onClose={closeDrawer} returnFocusRef={menuButtonRef} />
      )}
      <ScrollRestoration />
    </div>
  );
}
