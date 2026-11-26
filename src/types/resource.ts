export type CloudProvider = 'aws' | 'azure' | 'gcp';

/** 실행 중 / 중지됨 / 전환 중(시작·중지 진행) / 오류(상태 검사 실패) */
export type ResourceStatus = 'running' | 'stopped' | 'pending' | 'error';

/** 가상 서버 리소스 */
export interface Resource {
  /** 제공업체별 형식의 인스턴스 ID(AWS i-…, Azure azvm-…, GCP 숫자 19자리) */
  id: string;
  name: string;
  provider: CloudProvider;
  /** 제공업체 리전 코드(예: ap-northeast-2, koreacentral, asia-northeast3) */
  region: string;
  /** 제공업체 인스턴스 유형(예: t3.medium, Standard_D2s_v5, e2-standard-2) */
  instanceType: string;
  os: string;
  privateIp: string;
  /** 공인 IP가 없는 리소스는 null */
  publicIp: string | null;
  /** VPC(AWS·GCP) 또는 VNet(Azure) 이름 */
  network: string;
  subnet: string;
  status: ResourceStatus;
  /** 현재 사용률(%) 0~100. 중지된 리소스의 CPU·메모리는 0 */
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  diskSizeGb: number;
  monitoringEnabled: boolean;
  /** ISO 8601 */
  createdAt: string;
}

/** 등록·수정 폼에서 입력받는 값. 나머지(ID, 네트워크, 사용률, 생성일)는 서비스가 정한다. */
export interface ResourceInput {
  name: string;
  provider: CloudProvider;
  region: string;
  instanceType: string;
  os: string;
  privateIp: string;
  publicIp: string | null;
  monitoringEnabled: boolean;
}

/** 보안 그룹(AWS)·NSG(Azure)·방화벽 규칙(GCP)을 같은 형태로 표현한 인바운드 규칙 */
export interface SecurityRule {
  id: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  /** 포트 또는 범위(예: "443", "8000-8080", "전체") */
  port: string;
  source: string;
  description: string;
}
