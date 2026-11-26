/**
 * Mock 데이터 일관성 검사
 *
 * 화면이 없어도 데이터 규칙을 확인할 수 있도록, Vite로 실제 소스(src/mocks, src/services)를 불러와 검사한다.
 * (@/ 경로 별칭을 Vite 설정 그대로 해석하므로 별도 도구가 필요 없다.)
 *
 *   npm run check:data   규칙 위반이 있으면 종료 코드 1
 */
import { createServer } from 'vite';

import type * as CostsModule from '../src/mocks/costs';
import type * as MetricsModule from '../src/mocks/metrics';
import type * as UsersModule from '../src/mocks/users';
import type * as DashboardModule from '../src/services/dashboard';
import type * as SeedModule from '../src/services/seed';
import type * as ProvidersModule from '../src/constants/providers';
import type * as DemoModule from '../src/constants/demo';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const load = <T>(path: string) => server.ssrLoadModule(path) as Promise<T>;

const { createSeedSnapshot, getSeedCosts } = await load<typeof SeedModule>('/src/services/seed.ts');
const { generateMetricSeries, PERIOD_CONFIG } =
  await load<typeof MetricsModule>('/src/mocks/metrics.ts');
const { getCostMonths } = await load<typeof CostsModule>('/src/mocks/costs.ts');
const { CURRENT_USER_ID } = await load<typeof UsersModule>('/src/mocks/users.ts');
const { summarizeResources, getMonthlyCostSummary } = await load<typeof DashboardModule>(
  '/src/services/dashboard.ts',
);
const { PROVIDERS, findInstanceType } = await load<typeof ProvidersModule>(
  '/src/constants/providers.ts',
);
const { DEMO_REFERENCE_TIME } = await load<typeof DemoModule>('/src/constants/demo.ts');

const failures: string[] = [];
const check = (condition: boolean, message: string) => {
  if (!condition) failures.push(message);
};
const unique = (values: unknown[]) => new Set(values).size === values.length;

const seed = createSeedSnapshot();
const { resources, events, users } = seed;
const reference = new Date(DEMO_REFERENCE_TIME).getTime();

// 1) 결정성: 같은 시드는 항상 같은 데이터
check(
  JSON.stringify(createSeedSnapshot()) === JSON.stringify(seed),
  '시드 데이터가 호출마다 다릅니다',
);

// 2) 리소스
const byProvider = summarizeResources(resources).byProvider;
check(resources.length === 80, `리소스 수 80개가 아닙니다: ${String(resources.length)}`);
check(
  byProvider.aws.total === 34 && byProvider.azure.total === 24 && byProvider.gcp.total === 22,
  '제공업체별 리소스 수(34/24/22)가 다릅니다',
);
check(unique(resources.map((r) => r.id)), '리소스 ID가 중복됩니다');
check(unique(resources.map((r) => r.name)), '리소스 이름이 중복됩니다');
check(unique(resources.map((r) => r.privateIp)), '사설 IP가 중복됩니다');
check(unique(resources.flatMap((r) => (r.publicIp ? [r.publicIp] : []))), '공인 IP가 중복됩니다');
for (const r of resources) {
  const provider = PROVIDERS[r.provider];
  check(
    provider.regions.some((region) => region.code === r.region),
    `${r.name}: 제공업체에 없는 리전 ${r.region}`,
  );
  check(
    findInstanceType(r.provider, r.instanceType) !== undefined,
    `${r.name}: 제공업체에 없는 인스턴스 유형 ${r.instanceType}`,
  );
  check(provider.osOptions.includes(r.os), `${r.name}: 제공업체 목록에 없는 OS ${r.os}`);
  check(
    [r.cpuUsage, r.memoryUsage, r.diskUsage].every((v) => v >= 0 && v <= 100),
    `${r.name}: 사용률 범위 오류`,
  );
  if (r.status === 'stopped' || r.status === 'error') {
    check(
      r.cpuUsage === 0 && r.memoryUsage === 0,
      `${r.name}: 중지·오류 리소스의 CPU·메모리가 0이 아닙니다`,
    );
  }
  check(new Date(r.createdAt).getTime() < reference, `${r.name}: 생성일이 기준 시각 이후입니다`);
  if (r.provider === 'aws')
    check(/^i-0[0-9a-f]{16}$/.test(r.id), `${r.name}: AWS ID 형식 오류 ${r.id}`);
  if (r.provider === 'azure')
    check(/^azvm-[0-9a-f]{12}$/.test(r.id), `${r.name}: Azure ID 형식 오류 ${r.id}`);
  if (r.provider === 'gcp')
    check(/^[1-9]\d{18}$/.test(r.id), `${r.name}: GCP ID 형식 오류 ${r.id}`);
}

// 3) 모니터링: 마지막 값 = 현재 사용률, 지점 수, 결정성
for (const r of resources) {
  for (const period of ['1h', '24h', '7d'] as const) {
    const cpu = generateMetricSeries(r, 'cpu', period);
    const memory = generateMetricSeries(r, 'memory', period);
    const disk = generateMetricSeries(r, 'disk', period);
    check(cpu.points.length === PERIOD_CONFIG[period].points, `${r.name} ${period}: 지점 수 오류`);
    check(
      cpu.points.at(-1)?.value === Number(r.cpuUsage.toFixed(1)),
      `${r.name} ${period}: CPU 마지막 값 불일치`,
    );
    check(
      memory.points.at(-1)?.value === Number(r.memoryUsage.toFixed(1)),
      `${r.name} ${period}: 메모리 마지막 값 불일치`,
    );
    check(
      disk.points.at(-1)?.value === Number(r.diskUsage.toFixed(1)),
      `${r.name} ${period}: 디스크 마지막 값 불일치`,
    );
    check(
      cpu.points.at(-1)?.timestamp === new Date(reference).toISOString(),
      `${r.name} ${period}: 마지막 시각이 기준 시각이 아닙니다`,
    );
    check(
      JSON.stringify(generateMetricSeries(r, 'networkIn', period)) ===
        JSON.stringify(generateMetricSeries(r, 'networkIn', period)),
      `${r.name} ${period}: 시계열이 호출마다 다릅니다`,
    );
  }
}

// 4) 이벤트: 존재하는 리소스 참조, 최신순, 읽지 않음 5건, 상태와 일치
const resourceIds = new Set(resources.map((r) => r.id));
check(
  events.every((e) => resourceIds.has(e.resourceId)),
  '없는 리소스를 가리키는 이벤트가 있습니다',
);
check(
  events.every((e, i) => i === 0 || (events[i - 1]?.occurredAt ?? '') >= e.occurredAt),
  '이벤트가 최신순이 아닙니다',
);
check(events.filter((e) => !e.read).length === 5, '읽지 않은 이벤트가 5건이 아닙니다');
check(
  events.every((e) => new Date(e.occurredAt).getTime() <= reference),
  '기준 시각 이후의 이벤트가 있습니다',
);
for (const r of resources.filter((item) => item.status === 'error')) {
  check(
    events.some((e) => e.resourceId === r.id && e.severity === 'critical'),
    `${r.name}: 오류 상태인데 위험 이벤트가 없습니다`,
  );
}
for (const r of resources.filter((item) => item.cpuUsage >= 90)) {
  check(
    events.some((e) => e.resourceId === r.id && e.severity === 'critical'),
    `${r.name}: CPU 90% 이상인데 위험 이벤트가 없습니다`,
  );
}

// 5) 사용자
check(users.length === 24, `사용자 수 24명이 아닙니다: ${String(users.length)}`);
check(unique(users.map((u) => u.email)), '사용자 이메일이 중복됩니다');
check(
  users.some((u) => u.id === CURRENT_USER_ID && u.role === 'admin' && u.status === 'active'),
  '현재 사용자(관리자)가 없습니다',
);
check(
  users.every((u) => (u.status === 'invited') === (u.lastLoginAt === null)),
  '초대 상태와 최근 접속 기록이 맞지 않습니다',
);

// 6) 비용: 12개월 × 3개 제공업체 × 5개 분류, 컴퓨팅 비용과 리소스 구성 일치
const costs = getSeedCosts();
const months = getCostMonths();
check(
  months.length === 12 && months.at(-1) === '2026-11',
  `비용 월 범위 오류: ${months.join(', ')}`,
);
check(costs.length === 12 * 3 * 5, `비용 레코드 수 오류: ${String(costs.length)}`);
check(
  costs.every((c) => c.amount > 0),
  '0 이하의 비용이 있습니다',
);
for (const provider of ['aws', 'azure', 'gcp'] as const) {
  const expected = resources
    .filter((r) => r.provider === provider && r.status !== 'stopped')
    .reduce(
      (sum, r) => sum + (findInstanceType(provider, r.instanceType)?.hourlyUsd ?? 0) * 730,
      0,
    );
  const actual =
    costs.find((c) => c.month === '2026-11' && c.provider === provider && c.category === 'compute')
      ?.amount ?? 0;
  check(
    Math.abs(actual - expected) / expected <= 0.05,
    `${provider}: 이번 달 컴퓨팅 비용(${String(actual)})이 리소스 기준(${expected.toFixed(2)})과 5% 넘게 다릅니다`,
  );
}
const costSummary = getMonthlyCostSummary(costs);
check(
  costSummary !== null && costSummary.month === '2026-11',
  '이번 달 비용 요약을 만들 수 없습니다',
);

// 7) 서비스 등록·수정·삭제와 리듀서. 브라우저 대신 메모리 저장소로 localStorage를 흉내 낸다.
const memory = new Map<string, string>();
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    },
    setTimeout: (callback: () => void) => setTimeout(callback, 0),
  },
});

const demoDataService = await load<typeof import('../src/services/demoDataService')>(
  '/src/services/demoDataService.ts',
);
const resourceService = await load<typeof import('../src/services/resourceService')>(
  '/src/services/resourceService.ts',
);
const userService = await load<typeof import('../src/services/userService')>(
  '/src/services/userService.ts',
);
const eventService = await load<typeof import('../src/services/eventService')>(
  '/src/services/eventService.ts',
);
const { readSnapshot } = await load<typeof import('../src/services/storage')>(
  '/src/services/storage.ts',
);
const { demoDataReducer, initialDemoDataState } = await load<
  typeof import('../src/store/demoData/demoDataReducer')
>('/src/store/demoData/demoDataReducer.ts');

const loaded = await demoDataService.loadDemoData();
check(
  JSON.stringify(loaded) === JSON.stringify(readSnapshot()),
  '첫 불러오기에서 시드가 저장되지 않았습니다',
);
let state = demoDataReducer(initialDemoDataState, { type: 'loaded', snapshot: loaded });

const input = {
  name: 'prod-web-99',
  provider: 'aws' as const,
  region: 'ap-northeast-2',
  instanceType: 't3.medium',
  os: 'Amazon Linux 2023',
  privateIp: '10.10.1.251',
  publicIp: null,
  monitoringEnabled: true,
};
const created = await resourceService.createResource(input);
state = demoDataReducer(state, { type: 'resourceSaved', ...created });
check(
  readSnapshot()?.resources.some((r) => r.id === created.resource.id) === true,
  '등록한 리소스가 저장되지 않았습니다',
);
check(
  state.resources.length === 81 && state.events[0]?.id === created.event.id,
  '등록 후 상태(리소스·이벤트)가 맞지 않습니다',
);
check(
  created.resource.network === 'prod-vpc-apne2' && created.resource.subnet.startsWith('prod-web'),
  `등록 리소스 네트워크 규칙 오류: ${created.resource.network}`,
);

let duplicateRejected = false;
try {
  await resourceService.createResource({ ...input, name: 'prod-web-01' });
} catch (error) {
  duplicateRejected = error instanceof Error && error.name === 'DemoDataError';
}
check(duplicateRejected, '중복 이름 등록이 거부되지 않았습니다');

const updated = await resourceService.updateResource(created.resource.id, {
  ...input,
  instanceType: 't3.large',
});
state = demoDataReducer(state, { type: 'resourceSaved', ...updated });
check(
  state.resources.find((r) => r.id === created.resource.id)?.instanceType === 't3.large',
  '수정 내용이 상태에 반영되지 않았습니다',
);
check(state.resources.length === 81, '수정이 리소스를 새로 추가했습니다');

const target = resources[0];
const deleted = await resourceService.deleteResources([
  created.resource.id,
  target?.id ?? '',
  'no-such-id',
]);
state = demoDataReducer(state, {
  type: 'resourcesDeleted',
  ids: deleted.deletedIds,
  events: deleted.events,
});
check(
  deleted.deletedIds.length === 2 && state.resources.length === 79,
  '선택 삭제 결과가 맞지 않습니다',
);
check(readSnapshot()?.resources.length === 79, '삭제가 저장되지 않았습니다');

const readIds = await eventService.markAllEventsRead();
state = demoDataReducer(state, { type: 'eventsRead', ids: readIds });
check(
  state.events.every((e) => e.read) && readSnapshot()?.events.every((e) => e.read) === true,
  '모두 읽음이 반영되지 않았습니다',
);

const newUser = await userService.createUser({
  name: '테스트',
  email: 'Test.User@clouddesk.example',
  department: 'QA팀',
  role: 'viewer',
  status: 'invited',
});
check(
  newUser.email === 'test.user@clouddesk.example' && newUser.lastLoginAt === null,
  '사용자 등록 값이 맞지 않습니다',
);
let selfDeleteRejected = false;
try {
  await userService.deleteUser(CURRENT_USER_ID);
} catch {
  selfDeleteRejected = true;
}
check(selfDeleteRejected, '현재 사용자 삭제가 거부되지 않았습니다');

const reset = await demoDataService.resetDemoData();
check(JSON.stringify(reset) === JSON.stringify(seed), '초기화 결과가 시드와 다릅니다');

await server.close();

// 결과 출력
const summary = summarizeResources(resources);
console.log('리소스', summary.total, '개', JSON.stringify(summary.byStatus));
console.log(
  '제공업체별',
  Object.entries(summary.byProvider)
    .map(([p, s]) => `${p} ${String(s.total)}`)
    .join(', '),
);
console.log('이벤트', events.length, '건 (읽지 않음', events.filter((e) => !e.read).length, '건)');
console.log('사용자', users.length, '명');
console.log(
  '비용',
  costSummary
    ? `${costSummary.month} 합계 $${costSummary.total.toFixed(2)}, 전월 대비 ${String(costSummary.changeRate)}%`
    : '없음',
);

if (failures.length > 0) {
  console.error(`\n규칙 위반 ${String(failures.length)}건`);
  for (const failure of failures.slice(0, 30)) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\n모든 데이터 규칙을 통과했습니다.');
}
