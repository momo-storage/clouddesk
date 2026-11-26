import { DEMO_REFERENCE_TIME } from '@/constants/demo';
import type { User, UserRole, UserStatus } from '@/types/user';

import { createRandom } from './random';

/** 데모에서 로그인한 것으로 보는 사용자(헤더 사용자 메뉴) */
export const CURRENT_USER_ID = 'usr-001';

type UserSeed = [
  name: string,
  emailId: string,
  department: string,
  role: UserRole,
  status: UserStatus,
];

/** 이름·이메일은 모두 가상의 값이며 example 도메인(RFC 2606)을 쓴다. */
const USER_SEEDS: UserSeed[] = [
  ['김데모', 'admin', '플랫폼팀', 'admin', 'active'],
  ['이서준', 'seojun.lee', '플랫폼팀', 'admin', 'active'],
  ['박지민', 'jimin.park', '보안팀', 'admin', 'active'],
  ['최유진', 'yujin.choi', '인프라운영팀', 'operator', 'active'],
  ['정민호', 'minho.jung', '인프라운영팀', 'operator', 'active'],
  ['강하늘', 'haneul.kang', '인프라운영팀', 'operator', 'active'],
  ['조수아', 'sua.cho', '플랫폼팀', 'operator', 'active'],
  ['윤도현', 'dohyun.yoon', '데이터플랫폼팀', 'operator', 'active'],
  ['장예린', 'yerin.jang', '데이터플랫폼팀', 'operator', 'inactive'],
  ['임태윤', 'taeyun.lim', '인프라운영팀', 'operator', 'active'],
  ['한소율', 'soyul.han', '서비스개발팀', 'operator', 'invited'],
  ['오지훈', 'jihoon.oh', '서비스개발팀', 'viewer', 'active'],
  ['서하은', 'haeun.seo', '서비스개발팀', 'viewer', 'active'],
  ['신우진', 'woojin.shin', '서비스개발팀', 'viewer', 'active'],
  ['권나연', 'nayeon.kwon', 'QA팀', 'viewer', 'active'],
  ['황시우', 'siwoo.hwang', 'QA팀', 'viewer', 'inactive'],
  ['안채원', 'chaewon.ahn', '데이터플랫폼팀', 'viewer', 'active'],
  ['송현우', 'hyunwoo.song', '보안팀', 'viewer', 'active'],
  ['전다인', 'dain.jeon', '기획팀', 'viewer', 'active'],
  ['홍준서', 'junseo.hong', '기획팀', 'viewer', 'invited'],
  ['유가은', 'gaeun.yoo', '재무팀', 'billing', 'active'],
  ['고은호', 'eunho.ko', '재무팀', 'billing', 'active'],
  ['문서윤', 'seoyun.moon', '재무팀', 'billing', 'inactive'],
  ['배지호', 'jiho.bae', '구매팀', 'billing', 'active'],
];

export function createSeedUsers(): User[] {
  const random = createRandom(2024);
  const reference = new Date(DEMO_REFERENCE_TIME).getTime();
  const daysAgo = (min: number, max: number) =>
    new Date(reference - random.int(min * 24 * 60, max * 24 * 60) * 60_000).toISOString();

  return USER_SEEDS.map(([name, emailId, department, role, status], index) => ({
    id: `usr-${String(index + 1).padStart(3, '0')}`,
    name,
    email: `${emailId}@clouddesk.example`,
    department,
    role,
    status,
    // 현재 사용자는 방금 로그인한 것으로 본다. 비활성 사용자는 오래전, 초대된 사용자는 기록이 없다.
    lastLoginAt:
      status === 'invited'
        ? null
        : index === 0
          ? daysAgo(0, 0)
          : status === 'inactive'
            ? daysAgo(60, 180)
            : daysAgo(0, 14),
    createdAt: status === 'invited' ? daysAgo(1, 6) : daysAgo(120, 900),
  }));
}

function findSeedCurrentUser(): User {
  const user = createSeedUsers().find((item) => item.id === CURRENT_USER_ID);
  if (!user) throw new Error('시드 데이터에 현재 사용자가 없습니다.');
  return user;
}

/** 데이터를 불러오기 전 헤더에 먼저 보여줄 현재 사용자(시드 값) */
export const SEED_CURRENT_USER: User = findSeedCurrentUser();
