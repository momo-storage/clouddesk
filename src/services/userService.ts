import { CURRENT_USER_ID } from '@/mocks/users';
import type { User, UserInput } from '@/types/user';

import { withDelay } from './delay';
import { DemoDataError, getSnapshot, saveSnapshot } from './repository';

function assertUniqueEmail(users: User[], email: string, exceptId?: string): void {
  const normalized = email.trim().toLowerCase();
  if (users.some((user) => user.email.toLowerCase() === normalized && user.id !== exceptId)) {
    throw new DemoDataError(`이미 등록된 이메일입니다: ${email}`);
  }
}

/** 사용자 등록. 새 사용자는 아직 로그인 기록이 없다. */
export function createUser(input: UserInput): Promise<User> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    assertUniqueEmail(snapshot.users, input.email);
    const user: User = {
      ...input,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    };
    saveSnapshot({ ...snapshot, users: [user, ...snapshot.users] });
    return user;
  });
}

export function updateUser(id: string, input: UserInput): Promise<User> {
  return withDelay(() => {
    const snapshot = getSnapshot();
    const current = snapshot.users.find((user) => user.id === id);
    if (!current)
      throw new DemoDataError('사용자를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
    assertUniqueEmail(snapshot.users, input.email, id);
    const user: User = {
      ...current,
      ...input,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
    };
    saveSnapshot({
      ...snapshot,
      users: snapshot.users.map((item) => (item.id === id ? user : item)),
    });
    return user;
  });
}

/** 사용자 삭제. 로그인한 본인 계정은 삭제할 수 없다. */
export function deleteUser(id: string): Promise<string> {
  return withDelay(() => {
    if (id === CURRENT_USER_ID) {
      throw new DemoDataError('현재 로그인한 계정은 삭제할 수 없습니다.');
    }
    const snapshot = getSnapshot();
    saveSnapshot({ ...snapshot, users: snapshot.users.filter((user) => user.id !== id) });
    return id;
  });
}
