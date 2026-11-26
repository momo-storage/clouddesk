import type { CostCategory } from '@/types/cost';
import type { CloudProvider } from '@/types/resource';

export interface RegionOption {
  code: string;
  label: string;
}

export interface InstanceTypeOption {
  name: string;
  vcpu: number;
  memoryGib: number;
  /**
   * 시간당 온디맨드 요금(USD, Linux 기준 근사치).
   * 데모 비용 데이터를 만드는 데만 쓰며 실제 청구 요금과 다를 수 있다.
   */
  hourlyUsd: number;
}

export interface ProviderInfo {
  label: string;
  /** 리소스 ID·네트워크 이름 등 표기에 쓰는 네트워크 용어 */
  networkLabel: 'VPC' | 'VNet';
  regions: RegionOption[];
  instanceTypes: InstanceTypeOption[];
  osOptions: string[];
  /** 비용 분류별 실제 서비스명 */
  services: Record<CostCategory, string>;
}

export const PROVIDERS: Record<CloudProvider, ProviderInfo> = {
  aws: {
    label: 'AWS',
    networkLabel: 'VPC',
    regions: [
      { code: 'ap-northeast-2', label: '아시아 태평양(서울)' },
      { code: 'ap-northeast-1', label: '아시아 태평양(도쿄)' },
      { code: 'us-east-1', label: '미국 동부(버지니아 북부)' },
      { code: 'us-west-2', label: '미국 서부(오레곤)' },
    ],
    instanceTypes: [
      { name: 't3.small', vcpu: 2, memoryGib: 2, hourlyUsd: 0.026 },
      { name: 't3.medium', vcpu: 2, memoryGib: 4, hourlyUsd: 0.052 },
      { name: 't3.large', vcpu: 2, memoryGib: 8, hourlyUsd: 0.104 },
      { name: 'm6i.large', vcpu: 2, memoryGib: 8, hourlyUsd: 0.118 },
      { name: 'm6i.xlarge', vcpu: 4, memoryGib: 16, hourlyUsd: 0.236 },
      { name: 'c6i.xlarge', vcpu: 4, memoryGib: 8, hourlyUsd: 0.192 },
      { name: 'r6i.large', vcpu: 2, memoryGib: 16, hourlyUsd: 0.152 },
    ],
    osOptions: ['Amazon Linux 2023', 'Ubuntu 22.04 LTS', 'Ubuntu 24.04 LTS', 'Windows Server 2022'],
    services: {
      compute: 'Amazon EC2',
      storage: 'Amazon EBS',
      database: 'Amazon RDS',
      network: 'Data Transfer',
      monitoring: 'Amazon CloudWatch',
    },
  },
  azure: {
    label: 'Azure',
    networkLabel: 'VNet',
    regions: [
      { code: 'koreacentral', label: '한국 중부' },
      { code: 'koreasouth', label: '한국 남부' },
      { code: 'japaneast', label: '일본 동부' },
      { code: 'eastus', label: '미국 동부' },
    ],
    instanceTypes: [
      { name: 'Standard_B2s', vcpu: 2, memoryGib: 4, hourlyUsd: 0.0496 },
      { name: 'Standard_D2s_v5', vcpu: 2, memoryGib: 8, hourlyUsd: 0.115 },
      { name: 'Standard_D4s_v5', vcpu: 4, memoryGib: 16, hourlyUsd: 0.23 },
      { name: 'Standard_E2s_v5', vcpu: 2, memoryGib: 16, hourlyUsd: 0.151 },
      { name: 'Standard_F4s_v2', vcpu: 4, memoryGib: 8, hourlyUsd: 0.198 },
    ],
    osOptions: ['Ubuntu 22.04 LTS', 'Ubuntu 24.04 LTS', 'Rocky Linux 9', 'Windows Server 2022'],
    services: {
      compute: 'Virtual Machines',
      storage: 'Managed Disks',
      database: 'Azure SQL Database',
      network: 'Bandwidth',
      monitoring: 'Azure Monitor',
    },
  },
  gcp: {
    label: 'GCP',
    networkLabel: 'VPC',
    regions: [
      { code: 'asia-northeast3', label: '서울' },
      { code: 'asia-northeast1', label: '도쿄' },
      { code: 'us-central1', label: '아이오와' },
      { code: 'europe-west1', label: '벨기에' },
    ],
    instanceTypes: [
      { name: 'e2-small', vcpu: 2, memoryGib: 2, hourlyUsd: 0.0168 },
      { name: 'e2-medium', vcpu: 2, memoryGib: 4, hourlyUsd: 0.0335 },
      { name: 'e2-standard-2', vcpu: 2, memoryGib: 8, hourlyUsd: 0.067 },
      { name: 'e2-standard-4', vcpu: 4, memoryGib: 16, hourlyUsd: 0.134 },
      { name: 'n2-standard-4', vcpu: 4, memoryGib: 16, hourlyUsd: 0.194 },
      { name: 'c2-standard-4', vcpu: 4, memoryGib: 16, hourlyUsd: 0.209 },
    ],
    osOptions: ['Debian 12', 'Ubuntu 22.04 LTS', 'Rocky Linux 9', 'Windows Server 2022'],
    services: {
      compute: 'Compute Engine',
      storage: 'Persistent Disk',
      database: 'Cloud SQL',
      network: 'Networking',
      monitoring: 'Cloud Monitoring',
    },
  },
};

export const PROVIDER_KEYS: CloudProvider[] = ['aws', 'azure', 'gcp'];

export function findInstanceType(
  provider: CloudProvider,
  instanceType: string,
): InstanceTypeOption | undefined {
  return PROVIDERS[provider].instanceTypes.find((option) => option.name === instanceType);
}
