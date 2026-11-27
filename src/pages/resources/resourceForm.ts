import { PROVIDERS } from '@/constants/providers';
import type { CloudProvider, Resource, ResourceInput } from '@/types/resource';

/** 폼 입력값. 선택 상자는 고르기 전 빈 문자열이다. */
export interface ResourceFormValues {
  name: string;
  provider: CloudProvider;
  region: string;
  instanceType: string;
  os: string;
  privateIp: string;
  publicIp: string;
  monitoringEnabled: boolean;
}

export type ResourceFormField = Exclude<keyof ResourceFormValues, 'monitoringEnabled'>;
export type ResourceFormErrors = Partial<Record<ResourceFormField, string>>;

/** 화면에 나오는 순서. 제출 실패 시 이 순서로 첫 오류 칸에 초점을 준다. */
export const RESOURCE_FORM_FIELDS: ResourceFormField[] = [
  'name',
  'provider',
  'region',
  'instanceType',
  'os',
  'privateIp',
  'publicIp',
];

export function getInitialFormValues(resource: Resource | null): ResourceFormValues {
  if (resource) {
    return {
      name: resource.name,
      provider: resource.provider,
      region: resource.region,
      instanceType: resource.instanceType,
      os: resource.os,
      privateIp: resource.privateIp,
      publicIp: resource.publicIp ?? '',
      monitoringEnabled: resource.monitoringEnabled,
    };
  }
  return {
    name: '',
    provider: 'aws',
    region: '',
    instanceType: '',
    os: '',
    privateIp: '',
    publicIp: '',
    monitoringEnabled: true,
  };
}

/** 소문자로 시작, 소문자·숫자·하이픈 3~40자, 하이픈으로 끝나지 않음(클라우드 리소스 이름 규칙에 맞춘 공통 규칙) */
const NAME_PATTERN = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;
const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function isPrivateIpv4(ip: string): boolean {
  const [a = 0, b = 0] = ip.split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function validateResourceForm(
  values: ResourceFormValues,
  /** 같은 이름 검사에 쓰는 다른 리소스 이름(수정 중인 리소스 자신은 뺀다) */
  otherNames: ReadonlySet<string>,
): ResourceFormErrors {
  const errors: ResourceFormErrors = {};
  const name = values.name.trim();
  const privateIp = values.privateIp.trim();
  const publicIp = values.publicIp.trim();
  const provider = PROVIDERS[values.provider];

  if (!name) errors.name = '리소스명을 입력하세요.';
  else if (!NAME_PATTERN.test(name))
    errors.name =
      '소문자로 시작하고 소문자·숫자·하이픈(-)만 써서 3~40자로 입력하세요. 하이픈으로 끝날 수 없습니다.';
  else if (otherNames.has(name)) errors.name = '같은 이름의 리소스가 이미 있습니다.';

  if (!provider.regions.some((region) => region.code === values.region))
    errors.region = '리전을 선택하세요.';
  if (!provider.instanceTypes.some((type) => type.name === values.instanceType))
    errors.instanceType = '인스턴스 유형을 선택하세요.';
  if (!provider.osOptions.includes(values.os)) errors.os = '운영체제를 선택하세요.';

  if (!privateIp) errors.privateIp = '사설 IP 주소를 입력하세요.';
  else if (!IPV4_PATTERN.test(privateIp))
    errors.privateIp = 'IPv4 형식으로 입력하세요(예: 10.0.1.25).';
  else if (!isPrivateIpv4(privateIp))
    errors.privateIp = '사설 대역(10.x, 172.16~31.x, 192.168.x) 주소를 입력하세요.';

  if (publicIp) {
    if (!IPV4_PATTERN.test(publicIp))
      errors.publicIp = 'IPv4 형식으로 입력하세요(예: 203.0.113.10).';
    else if (isPrivateIpv4(publicIp))
      errors.publicIp = '공인 IP에는 사설 대역 주소를 쓸 수 없습니다.';
  }

  return errors;
}

export function toResourceInput(values: ResourceFormValues): ResourceInput {
  const publicIp = values.publicIp.trim();
  return {
    name: values.name.trim(),
    provider: values.provider,
    region: values.region,
    instanceType: values.instanceType,
    os: values.os,
    privateIp: values.privateIp.trim(),
    publicIp: publicIp === '' ? null : publicIp,
    monitoringEnabled: values.monitoringEnabled,
  };
}
