import { createRandom, hashString } from '@/mocks/random';
import { createResourceId } from '@/mocks/resources';
import { getNetworkNames } from '@/mocks/network';
import type { CloudEvent } from '@/types/event';
import type { Resource, ResourceInput } from '@/types/resource';

import { withDelay } from './delay';
import { createActivityEvent, DemoDataError, getSnapshot, saveSnapshot } from './repository';

function assertUniqueName(resources: Resource[], name: string, exceptId?: string): void {
  const duplicate = resources.some(
    (resource) => resource.name === name.trim() && resource.id !== exceptId,
  );
  if (duplicate) {
    throw new DemoDataError(`이미 같은 이름의 리소스가 있습니다: ${name}`);
  }
}

export interface ResourceMutationResult {
  resource: Resource;
  event: CloudEvent;
}

/**
 * 리소스 등록. ID·네트워크·생성일은 서비스가 정한다.
 * 새 리소스는 실행 중 상태로 만들고, 초기 사용률은 ID에서 정해 다시 계산해도 같다.
 */
export function createResource(input: ResourceInput): Promise<ResourceMutationResult> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    assertUniqueName(snapshot.resources, input.name);

    const id = createResourceId(input.provider, createRandom(hashString(crypto.randomUUID())));
    const usage = createRandom(hashString(id));
    const name = input.name.trim();
    const resource: Resource = {
      ...input,
      name,
      id,
      ...getNetworkNames(input.provider, input.region, name),
      status: 'running',
      cpuUsage: usage.float(3, 15),
      memoryUsage: usage.float(15, 30),
      diskUsage: usage.float(8, 15),
      diskSizeGb: 50,
      createdAt: new Date().toISOString(),
    };
    const event = createActivityEvent({
      resourceId: id,
      resourceName: name,
      provider: resource.provider,
      severity: 'info',
      message: '리소스가 등록되었습니다.',
    });

    saveSnapshot({
      ...snapshot,
      resources: [resource, ...snapshot.resources],
      events: [event, ...snapshot.events],
    });
    return { resource, event };
  });
}

/** 리소스 수정. 입력 항목만 바꾸고 상태·사용률·생성일은 유지한다. */
export function updateResource(id: string, input: ResourceInput): Promise<ResourceMutationResult> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    const current = snapshot.resources.find((resource) => resource.id === id);
    if (!current) {
      throw new DemoDataError('리소스를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
    }
    assertUniqueName(snapshot.resources, input.name, id);

    const name = input.name.trim();
    const resource: Resource = {
      ...current,
      ...input,
      name,
      ...getNetworkNames(input.provider, input.region, name),
    };
    const event = createActivityEvent({
      resourceId: id,
      resourceName: name,
      provider: resource.provider,
      severity: 'info',
      message: '리소스 정보가 수정되었습니다.',
    });

    saveSnapshot({
      ...snapshot,
      resources: snapshot.resources.map((item) => (item.id === id ? resource : item)),
      events: [event, ...snapshot.events],
    });
    return { resource, event };
  });
}

export interface ResourceDeleteResult {
  deletedIds: string[];
  events: CloudEvent[];
}

/** 단건·선택 삭제. 이미 없는 ID는 건너뛴다. 삭제 이벤트는 리소스마다 남긴다. */
export function deleteResources(ids: string[]): Promise<ResourceDeleteResult> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    const targets = snapshot.resources.filter((resource) => ids.includes(resource.id));
    const events = targets.map((resource) =>
      createActivityEvent({
        resourceId: resource.id,
        resourceName: resource.name,
        provider: resource.provider,
        severity: 'warning',
        message: '리소스가 삭제되었습니다.',
      }),
    );
    const deletedIds = targets.map((resource) => resource.id);

    saveSnapshot({
      ...snapshot,
      resources: snapshot.resources.filter((resource) => !deletedIds.includes(resource.id)),
      events: [...events, ...snapshot.events],
    });
    return { deletedIds, events };
  });
}
