import { createBrowserRouter, redirect } from 'react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { HOME_PATH } from '@/constants/navigation';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { GuidePage } from '@/pages/guide/GuidePage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { ResourceDetailPage } from '@/pages/resources/ResourceDetailPage';
import { ResourceListPage } from '@/pages/resources/ResourceListPage';

import type { RouteHandle } from './routeMeta';

/**
 * 라우트 정의. handle.title이 문서 제목과 Breadcrumb의 원천이다.
 * 2차 개발 화면(/monitoring, /costs, /users)은 구현 전까지 라우트를 두지 않는다(404로 처리).
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // 렌더링 전에 이동시켜, 최초 로드가 페이지 전환으로 처리되어 초점이 이동하지 않게 한다.
      { index: true, loader: () => redirect(HOME_PATH) },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        handle: { title: '대시보드' } satisfies RouteHandle,
      },
      {
        path: 'resources',
        handle: { title: '리소스 관리' } satisfies RouteHandle,
        children: [
          { index: true, element: <ResourceListPage /> },
          {
            path: ':resourceId',
            element: <ResourceDetailPage />,
            // Phase 2-5 이후 리소스 이름으로 바꾼다.
            handle: { title: (params) => params.resourceId ?? '리소스 상세' } satisfies RouteHandle,
          },
        ],
      },
      {
        path: 'guide',
        element: <GuidePage />,
        handle: { title: 'UI 컴포넌트 가이드' } satisfies RouteHandle,
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { title: '페이지를 찾을 수 없습니다' } satisfies RouteHandle,
      },
    ],
  },
]);
