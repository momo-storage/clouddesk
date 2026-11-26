import { PROVIDERS } from '@/constants/providers';
import type { CloudProvider, Resource, ResourceStatus } from '@/types/resource';

import {
  getEnvironment,
  getNetworkNames,
  getTier,
  PRIVATE_IP_PREFIX,
  TIER_SUBNET,
  type Environment,
} from './network';
import { createRandom, type SeededRandom } from './random';

/**
 * 시드 리소스 80개(AWS 34, Azure 24, GCP 22).
 * 실제 기업의 멀티 클라우드 구성처럼 제공업체마다 맡은 업무를 나눴다.
 * - AWS: 고객 서비스(웹·API·DB·배치)
 * - Azure: 사내 업무 시스템(ERP, 그룹웨어 포털, AD)
 * - GCP: 데이터·ML 플랫폼
 */

interface Workload {
  provider: CloudProvider;
  env: Environment;
  role: string;
  count: number;
  instanceTypes: string[];
  os: string[];
  /** 사용률 범위(%) */
  cpu: [number, number];
  memory: [number, number];
  disk: [number, number];
  diskSizeGb: number[];
  publicIp?: boolean;
}

const WORKLOADS: Workload[] = [
  // AWS 34
  {
    provider: 'aws',
    env: 'prod',
    role: 'web',
    count: 4,
    instanceTypes: ['t3.large', 'm6i.large'],
    os: ['Amazon Linux 2023'],
    cpu: [35, 78],
    memory: [40, 70],
    disk: [25, 55],
    diskSizeGb: [50, 100],
    publicIp: true,
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'api',
    count: 4,
    instanceTypes: ['m6i.large', 'm6i.xlarge'],
    os: ['Amazon Linux 2023'],
    cpu: [45, 93],
    memory: [50, 82],
    disk: [30, 60],
    diskSizeGb: [100],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'db',
    count: 2,
    instanceTypes: ['r6i.large'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [50, 88],
    memory: [70, 92],
    disk: [60, 88],
    diskSizeGb: [500, 1000],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'cache',
    count: 2,
    instanceTypes: ['r6i.large'],
    os: ['Amazon Linux 2023'],
    cpu: [18, 45],
    memory: [65, 88],
    disk: [15, 30],
    diskSizeGb: [50],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'batch',
    count: 2,
    instanceTypes: ['c6i.xlarge'],
    os: ['Amazon Linux 2023'],
    cpu: [20, 97],
    memory: [30, 75],
    disk: [35, 70],
    diskSizeGb: [200],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'worker',
    count: 3,
    instanceTypes: ['m6i.large'],
    os: ['Amazon Linux 2023'],
    cpu: [30, 80],
    memory: [40, 75],
    disk: [20, 50],
    diskSizeGb: [100],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'etl',
    count: 2,
    instanceTypes: ['c6i.xlarge'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [40, 91],
    memory: [45, 80],
    disk: [45, 82],
    diskSizeGb: [200],
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'bastion',
    count: 1,
    instanceTypes: ['t3.small'],
    os: ['Amazon Linux 2023'],
    cpu: [2, 8],
    memory: [15, 25],
    disk: [12, 20],
    diskSizeGb: [30],
    publicIp: true,
  },
  {
    provider: 'aws',
    env: 'prod',
    role: 'monitor',
    count: 1,
    instanceTypes: ['t3.large'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [20, 45],
    memory: [45, 70],
    disk: [50, 86],
    diskSizeGb: [200],
  },
  {
    provider: 'aws',
    env: 'stg',
    role: 'web',
    count: 2,
    instanceTypes: ['t3.medium'],
    os: ['Amazon Linux 2023'],
    cpu: [8, 35],
    memory: [25, 50],
    disk: [20, 40],
    diskSizeGb: [50],
    publicIp: true,
  },
  {
    provider: 'aws',
    env: 'stg',
    role: 'api',
    count: 2,
    instanceTypes: ['t3.medium'],
    os: ['Amazon Linux 2023'],
    cpu: [10, 40],
    memory: [30, 55],
    disk: [20, 45],
    diskSizeGb: [50],
  },
  {
    provider: 'aws',
    env: 'stg',
    role: 'db',
    count: 1,
    instanceTypes: ['t3.large'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [15, 45],
    memory: [50, 75],
    disk: [40, 70],
    diskSizeGb: [200],
  },
  {
    provider: 'aws',
    env: 'stg',
    role: 'worker',
    count: 2,
    instanceTypes: ['t3.medium'],
    os: ['Amazon Linux 2023'],
    cpu: [5, 30],
    memory: [20, 45],
    disk: [15, 35],
    diskSizeGb: [50],
  },
  {
    provider: 'aws',
    env: 'dev',
    role: 'web',
    count: 2,
    instanceTypes: ['t3.small', 't3.medium'],
    os: ['Ubuntu 24.04 LTS'],
    cpu: [3, 25],
    memory: [20, 45],
    disk: [15, 40],
    diskSizeGb: [30],
  },
  {
    provider: 'aws',
    env: 'dev',
    role: 'api',
    count: 2,
    instanceTypes: ['t3.medium'],
    os: ['Ubuntu 24.04 LTS'],
    cpu: [5, 35],
    memory: [25, 50],
    disk: [15, 45],
    diskSizeGb: [50],
  },
  {
    provider: 'aws',
    env: 'dev',
    role: 'batch',
    count: 1,
    instanceTypes: ['t3.medium'],
    os: ['Amazon Linux 2023'],
    cpu: [5, 60],
    memory: [20, 40],
    disk: [20, 40],
    diskSizeGb: [50],
  },
  {
    provider: 'aws',
    env: 'dev',
    role: 'jenkins',
    count: 1,
    instanceTypes: ['m6i.large'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [10, 65],
    memory: [40, 70],
    disk: [55, 87],
    diskSizeGb: [200],
  },
  // Azure 24
  {
    provider: 'azure',
    env: 'prod',
    role: 'erp-app',
    count: 3,
    instanceTypes: ['Standard_D4s_v5'],
    os: ['Windows Server 2022'],
    cpu: [30, 75],
    memory: [55, 85],
    disk: [35, 65],
    diskSizeGb: [128, 256],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'erp-db',
    count: 2,
    instanceTypes: ['Standard_E2s_v5'],
    os: ['Windows Server 2022'],
    cpu: [45, 92],
    memory: [72, 94],
    disk: [60, 89],
    diskSizeGb: [512, 1024],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'ad',
    count: 2,
    instanceTypes: ['Standard_B2s'],
    os: ['Windows Server 2022'],
    cpu: [8, 25],
    memory: [35, 55],
    disk: [25, 40],
    diskSizeGb: [128],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'file',
    count: 1,
    instanceTypes: ['Standard_D2s_v5'],
    os: ['Windows Server 2022'],
    cpu: [5, 20],
    memory: [30, 50],
    disk: [70, 91],
    diskSizeGb: [2048],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'portal-web',
    count: 3,
    instanceTypes: ['Standard_D2s_v5'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [25, 70],
    memory: [40, 70],
    disk: [20, 45],
    diskSizeGb: [64],
    publicIp: true,
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'portal-api',
    count: 3,
    instanceTypes: ['Standard_D2s_v5', 'Standard_F4s_v2'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [35, 85],
    memory: [45, 78],
    disk: [25, 50],
    diskSizeGb: [64],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'backup',
    count: 1,
    instanceTypes: ['Standard_B2s'],
    os: ['Rocky Linux 9'],
    cpu: [5, 25],
    memory: [20, 40],
    disk: [65, 88],
    diskSizeGb: [1024],
  },
  {
    provider: 'azure',
    env: 'prod',
    role: 'ops-monitor',
    count: 1,
    instanceTypes: ['Standard_B2s'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [15, 40],
    memory: [40, 65],
    disk: [40, 75],
    diskSizeGb: [128],
  },
  {
    provider: 'azure',
    env: 'stg',
    role: 'erp-app',
    count: 2,
    instanceTypes: ['Standard_D2s_v5'],
    os: ['Windows Server 2022'],
    cpu: [8, 35],
    memory: [35, 60],
    disk: [30, 55],
    diskSizeGb: [128],
  },
  {
    provider: 'azure',
    env: 'stg',
    role: 'portal-web',
    count: 2,
    instanceTypes: ['Standard_B2s'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [5, 25],
    memory: [25, 45],
    disk: [15, 35],
    diskSizeGb: [64],
    publicIp: true,
  },
  {
    provider: 'azure',
    env: 'dev',
    role: 'erp-app',
    count: 2,
    instanceTypes: ['Standard_B2s'],
    os: ['Windows Server 2022'],
    cpu: [3, 30],
    memory: [30, 55],
    disk: [25, 50],
    diskSizeGb: [128],
  },
  {
    provider: 'azure',
    env: 'dev',
    role: 'portal-api',
    count: 2,
    instanceTypes: ['Standard_B2s'],
    os: ['Ubuntu 24.04 LTS'],
    cpu: [3, 30],
    memory: [20, 45],
    disk: [15, 40],
    diskSizeGb: [64],
  },
  // GCP 22
  {
    provider: 'gcp',
    env: 'prod',
    role: 'ml-train',
    count: 2,
    instanceTypes: ['c2-standard-4'],
    os: ['Debian 12'],
    cpu: [72, 98],
    memory: [65, 90],
    disk: [55, 85],
    diskSizeGb: [500],
  },
  {
    provider: 'gcp',
    env: 'prod',
    role: 'ml-serve',
    count: 3,
    instanceTypes: ['n2-standard-4'],
    os: ['Debian 12'],
    cpu: [40, 82],
    memory: [55, 85],
    disk: [25, 50],
    diskSizeGb: [100],
  },
  {
    provider: 'gcp',
    env: 'prod',
    role: 'data-etl',
    count: 3,
    instanceTypes: ['e2-standard-4'],
    os: ['Debian 12'],
    cpu: [30, 92],
    memory: [40, 80],
    disk: [45, 86],
    diskSizeGb: [250],
  },
  {
    provider: 'gcp',
    env: 'prod',
    role: 'analytics',
    count: 2,
    instanceTypes: ['e2-standard-4'],
    os: ['Ubuntu 22.04 LTS'],
    cpu: [25, 70],
    memory: [50, 80],
    disk: [40, 70],
    diskSizeGb: [250],
  },
  {
    provider: 'gcp',
    env: 'prod',
    role: 'gateway',
    count: 3,
    instanceTypes: ['e2-standard-2'],
    os: ['Debian 12'],
    cpu: [30, 72],
    memory: [35, 60],
    disk: [20, 40],
    diskSizeGb: [50],
    publicIp: true,
  },
  {
    provider: 'gcp',
    env: 'prod',
    role: 'feature-cache',
    count: 2,
    instanceTypes: ['e2-standard-2'],
    os: ['Debian 12'],
    cpu: [20, 50],
    memory: [65, 88],
    disk: [15, 30],
    diskSizeGb: [50],
  },
  {
    provider: 'gcp',
    env: 'stg',
    role: 'ml-serve',
    count: 2,
    instanceTypes: ['e2-standard-2'],
    os: ['Debian 12'],
    cpu: [5, 35],
    memory: [30, 55],
    disk: [20, 40],
    diskSizeGb: [50],
  },
  {
    provider: 'gcp',
    env: 'dev',
    role: 'notebook',
    count: 3,
    instanceTypes: ['e2-medium', 'e2-standard-2'],
    os: ['Debian 12', 'Ubuntu 22.04 LTS'],
    cpu: [3, 45],
    memory: [25, 70],
    disk: [30, 75],
    diskSizeGb: [100],
  },
  {
    provider: 'gcp',
    env: 'dev',
    role: 'gateway',
    count: 2,
    instanceTypes: ['e2-small'],
    os: ['Debian 12'],
    cpu: [2, 20],
    memory: [20, 40],
    disk: [15, 30],
    diskSizeGb: [30],
  },
];

/** 환경별 상태 확률: 운영은 대부분 실행 중, 개발·스테이징은 업무 시간 외 중지가 많다. */
const STATUS_WEIGHTS: Record<Environment, [ResourceStatus, number][]> = {
  prod: [
    ['running', 0.86],
    ['error', 0.06],
    ['pending', 0.04],
    ['stopped', 0.04],
  ],
  stg: [
    ['running', 0.55],
    ['stopped', 0.4],
    ['pending', 0.05],
  ],
  dev: [
    ['running', 0.45],
    ['stopped', 0.5],
    ['error', 0.05],
  ],
};

/** 운영은 오래 전부터, 개발은 최근에 만든 리소스가 많다. */
const CREATED_RANGE: Record<Environment, [string, string]> = {
  prod: ['2024-03-04T10:00:00+09:00', '2026-06-30T18:00:00+09:00'],
  stg: ['2025-01-06T10:00:00+09:00', '2026-09-30T18:00:00+09:00'],
  dev: ['2025-06-02T10:00:00+09:00', '2026-11-20T18:00:00+09:00'],
};

const PUBLIC_IP_BLOCKS = ['203.0.113', '198.51.100', '192.0.2'];

function pickStatus(random: SeededRandom, env: Environment): ResourceStatus {
  const roll = random.next();
  let sum = 0;
  for (const [status, weight] of STATUS_WEIGHTS[env]) {
    sum += weight;
    if (roll < sum) return status;
  }
  return 'running';
}

/** 제공업체별 실제 형식에 가까운 인스턴스 ID */
export function createResourceId(provider: CloudProvider, random: SeededRandom): string {
  switch (provider) {
    case 'aws':
      return `i-0${random.hex(16)}`;
    case 'azure':
      return `azvm-${random.hex(12)}`;
    case 'gcp':
      return `${String(random.int(1, 9))}${Array.from({ length: 18 }, () => String(random.int(0, 9))).join('')}`;
  }
}

/** 상태에 따라 현재 사용률을 정한다. 중지·오류 상태는 CPU·메모리를 쓰지 않는다. 디스크는 상태와 무관하다. */
function usageFor(random: SeededRandom, workload: Workload, status: ResourceStatus) {
  const disk = random.float(...workload.disk);
  if (status === 'stopped' || status === 'error') return { cpu: 0, memory: 0, disk };
  if (status === 'pending') return { cpu: random.float(2, 9), memory: random.float(8, 20), disk };
  return { cpu: random.float(...workload.cpu), memory: random.float(...workload.memory), disk };
}

function randomDate(random: SeededRandom, [from, to]: [string, string]): string {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  // 분 단위로 맞춘다.
  const time = Math.floor((start + random.next() * (end - start)) / 60_000) * 60_000;
  return new Date(time).toISOString();
}

export function createSeedResources(): Resource[] {
  const random = createRandom(20261126);
  const usedHosts = new Set<string>();
  let publicIndex = 10;
  const regionOf = (workload: Workload) => {
    const regions = PROVIDERS[workload.provider].regions.map((region) => region.code);
    const [primary = '', secondary = ''] = regions;
    // 운영 일부는 재해 복구·해외 서비스를 위해 두 번째 리전에 둔다.
    if (workload.env === 'prod' && random.chance(0.2)) return secondary;
    return primary;
  };

  return WORKLOADS.flatMap((workload) =>
    Array.from({ length: workload.count }, (_, index) => {
      const name = `${workload.env}-${workload.role}-${String(index + 1).padStart(2, '0')}`;
      const region = regionOf(workload);
      const status = pickStatus(random, getEnvironment(name));
      const usage = usageFor(random, workload, status);
      const tier = getTier(name);

      let privateIp: string;
      do {
        privateIp = `${PRIVATE_IP_PREFIX[workload.provider]}.${String(TIER_SUBNET[tier])}.${String(random.int(10, 250))}`;
      } while (usedHosts.has(privateIp));
      usedHosts.add(privateIp);

      const publicIp = workload.publicIp
        ? `${random.pick(PUBLIC_IP_BLOCKS)}.${String((publicIndex += random.int(1, 7)))}`
        : null;

      const resource: Resource = {
        id: createResourceId(workload.provider, random),
        name,
        provider: workload.provider,
        region,
        instanceType: random.pick(workload.instanceTypes),
        os: random.pick(workload.os),
        privateIp,
        publicIp,
        ...getNetworkNames(workload.provider, region, name),
        status,
        cpuUsage: usage.cpu,
        memoryUsage: usage.memory,
        diskUsage: usage.disk,
        diskSizeGb: random.pick(workload.diskSizeGb),
        // 개발용 노트북 등 일부만 모니터링을 끈다.
        monitoringEnabled: workload.env === 'prod' || random.chance(0.6),
        createdAt: randomDate(random, CREATED_RANGE[workload.env]),
      };
      return resource;
    }),
  );
}
