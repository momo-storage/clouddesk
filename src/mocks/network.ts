import type { CloudProvider, Resource, SecurityRule } from '@/types/resource';

/**
 * 네트워크 정보(VPC·서브넷, 보안 규칙)를 리소스 이름과 리전에서 규칙적으로 만든다.
 * 시드 데이터와 새로 등록한 리소스가 같은 규칙을 따르므로 저장하지 않고 계산한다(보안 규칙).
 */

export type Environment = 'prod' | 'stg' | 'dev';
export type Tier = 'web' | 'app' | 'data' | 'mgmt';

export const ENVIRONMENT_LABEL: Record<Environment, string> = {
  prod: '운영',
  stg: '스테이징',
  dev: '개발',
};

/** 이름 규칙: {환경}-{역할}-{번호}. 규칙을 따르지 않는 이름은 운영 환경으로 본다. */
export function getEnvironment(name: string): Environment {
  if (name.startsWith('stg-')) return 'stg';
  if (name.startsWith('dev-')) return 'dev';
  return 'prod';
}

export function getTier(name: string): Tier {
  if (/(^|-)(web|portal-web|gateway)(-|$)/.test(name)) return 'web';
  if (/(^|-)(db|erp-db|cache|feature-cache|file|backup)(-|$)/.test(name)) return 'data';
  if (/(^|-)(bastion|monitor|ad|jenkins)(-|$)/.test(name)) return 'mgmt';
  return 'app';
}

/** AWS 리전 코드의 관례적 짧은 표기(ap-northeast-2 → apne2, us-east-1 → use1) */
function shortRegion(region: string): string {
  const [area = '', direction = '', number = ''] = region.split('-');
  const compass = direction
    .replace('north', 'n')
    .replace('south', 's')
    .replace('east', 'e')
    .replace('west', 'w')
    .replace('central', 'c');
  return `${area}${compass}${number}`;
}

export function getNetworkNames(
  provider: CloudProvider,
  region: string,
  name: string,
): { network: string; subnet: string } {
  const env = getEnvironment(name);
  const tier = getTier(name);
  switch (provider) {
    case 'aws':
      return {
        network: `${env}-vpc-${shortRegion(region)}`,
        subnet: `${env}-${tier}-subnet-${tier === 'web' ? 'public' : 'private'}-a`,
      };
    case 'azure':
      return { network: `vnet-${env}-${region}`, subnet: `snet-${tier}` };
    case 'gcp':
      return { network: `${env}-vpc`, subnet: `${env}-${tier}-${region}` };
  }
}

/** 제공업체별 사설 IP 대역(10.10/10.20/10.30)과 계층별 서브넷 번호 */
export const PRIVATE_IP_PREFIX: Record<CloudProvider, string> = {
  aws: '10.10',
  azure: '10.20',
  gcp: '10.30',
};

export const TIER_SUBNET: Record<Tier, number> = { web: 1, app: 2, data: 3, mgmt: 4 };

/** 계층에 따른 인바운드 규칙. 데모용 표시 데이터다. */
export function getSecurityRules(resource: Resource): SecurityRule[] {
  const tier = getTier(resource.name);
  const vpcCidr = `${PRIVATE_IP_PREFIX[resource.provider]}.0.0/16`;
  const adminCidr = `${PRIVATE_IP_PREFIX[resource.provider]}.4.0/24`;
  const rule = (index: number, values: Omit<SecurityRule, 'id'>): SecurityRule => ({
    id: `${resource.id}-rule-${index}`,
    ...values,
  });

  const ssh = resource.os.startsWith('Windows')
    ? rule(9, {
        protocol: 'TCP',
        port: '3389',
        source: adminCidr,
        description: '관리 서브넷 RDP 접속',
      })
    : rule(9, {
        protocol: 'TCP',
        port: '22',
        source: adminCidr,
        description: '관리 서브넷 SSH 접속',
      });

  switch (tier) {
    case 'web':
      return [
        rule(1, {
          protocol: 'TCP',
          port: '443',
          source: '0.0.0.0/0',
          description: 'HTTPS 공개 접속',
        }),
        rule(2, {
          protocol: 'TCP',
          port: '80',
          source: '0.0.0.0/0',
          description: 'HTTP → HTTPS 리다이렉트',
        }),
        ssh,
      ];
    case 'app':
      return [
        rule(1, {
          protocol: 'TCP',
          port: '8080',
          source: vpcCidr,
          description: '내부 애플리케이션 트래픽',
        }),
        rule(2, {
          protocol: 'TCP',
          port: '9100',
          source: adminCidr,
          description: '지표 수집(Node Exporter)',
        }),
        ssh,
      ];
    case 'data':
      return [
        rule(1, {
          protocol: 'TCP',
          port: '5432',
          source: `${PRIVATE_IP_PREFIX[resource.provider]}.2.0/24`,
          description: '애플리케이션 서브넷 DB 접속',
        }),
        rule(2, {
          protocol: 'TCP',
          port: '6379',
          source: `${PRIVATE_IP_PREFIX[resource.provider]}.2.0/24`,
          description: '캐시 접속',
        }),
        ssh,
      ];
    case 'mgmt':
      return [
        rule(1, {
          protocol: 'TCP',
          port: '22',
          source: '198.51.100.0/24',
          description: '사내 VPN 대역 접속',
        }),
        rule(2, {
          protocol: 'ICMP',
          port: '전체',
          source: vpcCidr,
          description: '내부 상태 확인(ping)',
        }),
      ];
  }
}
