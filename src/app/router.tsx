import { createBrowserRouter, redirect } from 'react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/layout/RouteFallback';
import { HOME_PATH } from '@/constants/navigation';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { ResourceListPage } from '@/pages/resources/ResourceListPage';

import type { RouteHandle } from './routeMeta';

/**
 * 라우트 정의. handle.title이 문서 제목과 Breadcrumb의 원천이다.
 * 2차 개발 화면 중 아직 구현하지 않은 화면(/costs, /users)은 라우트를 두지 않는다(404로 처리).
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // 첫 화면이 지연 로딩 라우트일 때 코드가 도착하기 전까지 보여준다.
    HydrateFallback: RouteFallback,
    children: [
      // 렌더링 전에 이동시켜, 최초 로드가 페이지 전환으로 처리되어 초점이 이동하지 않게 한다.
      { index: true, loader: () => redirect(HOME_PATH) },
      {
        path: 'dashboard',
        // 차트 라이브러리(Recharts)가 커서 차트를 쓰는 화면은 라우트 단위로 나눠 불러온다(설계서 4-1).
        // 이동이 끝나기 전에 불러오므로 화면이 그려질 때 h1이 있어 초점 이동 규칙이 그대로 동작한다.
        lazy: async () => ({
          Component: (await import('@/pages/dashboard/DashboardPage')).DashboardPage,
        }),
        handle: { title: '대시보드' } satisfies RouteHandle,
      },
      {
        path: 'resources',
        handle: { title: '리소스 관리' } satisfies RouteHandle,
        children: [
          { index: true, element: <ResourceListPage /> },
          {
            path: ':resourceId',
            // 모니터링 차트(Recharts)를 쓰므로 대시보드처럼 라우트 단위로 나눠 불러온다.
            lazy: async () => ({
              Component: (await import('@/pages/resources/ResourceDetailPage')).ResourceDetailPage,
            }),
            // 제목·Breadcrumb은 리소스명. 불러오는 중이거나 없는 리소스면 그 상태를 이름으로 쓴다.
            handle: {
              title: (params, data) =>
                data.resources.find((resource) => resource.id === params.resourceId)?.name ??
                (data.status === 'loading' ? '리소스 상세' : '리소스를 찾을 수 없음'),
            } satisfies RouteHandle,
          },
        ],
      },
      {
        path: 'monitoring',
        lazy: async () => ({
          Component: (await import('@/pages/monitoring/MonitoringPage')).MonitoringPage,
        }),
        handle: { title: '모니터링' } satisfies RouteHandle,
      },
      {
        path: 'guide',
        // 차트 예시를 포함하므로 다른 차트 화면처럼 나눠 불러온다.
        lazy: async () => ({
          Component: (await import('@/pages/guide/GuidePage')).GuidePage,
        }),
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
