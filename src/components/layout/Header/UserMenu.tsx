import { ChevronDown, Component, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Dropdown, DropdownItem, DropdownLinkItem, DropdownList } from '@/components/ui/Dropdown';
import { ConfirmModal } from '@/components/ui/Modal';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { ROLE_LABEL } from '@/constants/roles';
import { CURRENT_USER_ID, SEED_CURRENT_USER } from '@/mocks/users';
import { useDemoData } from '@/store/demoData/demoDataContext';
import { useToast } from '@/store/toast/toastContext';

import styles from './UserMenu.module.scss';

export interface UserMenuProps {
  /** 헤더의 사용자 버튼 모양 */
  triggerClassName?: string;
}

/** 헤더 사용자 메뉴: 프로필 요약, 가이드 이동, 데모 데이터 초기화(설계서 3-2) */
export function UserMenu({ triggerClassName }: UserMenuProps) {
  const { state, actions } = useDemoData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 데이터를 불러오기 전에도 헤더가 비지 않도록 시드 사용자 정보를 먼저 쓴다.
  const user = state.users.find((item) => item.id === CURRENT_USER_ID) ?? SEED_CURRENT_USER;

  const resetDemoData = async () => {
    setResetting(true);
    try {
      await actions.resetDemoData();
      setConfirmOpen(false);
      showToast('데모 데이터를 처음 상태로 초기화했습니다.');
    } catch {
      showToast('데모 데이터를 초기화하지 못했습니다. 잠시 후 다시 시도하세요.', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Dropdown
        align="end"
        triggerClassName={triggerClassName}
        trigger={
          <>
            <span className={styles.avatar} aria-hidden="true">
              {user.name.charAt(0)}
            </span>
            <span className={styles.userName}>{user.name}</span>
            <VisuallyHidden>계정 메뉴</VisuallyHidden>
            <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
          </>
        }
      >
        {(close) => (
          <>
            <div className={styles.profile}>
              <p className={styles.profileName}>{user.name}</p>
              <p className={styles.profileMeta}>{user.email}</p>
              <p className={styles.profileMeta}>
                {user.department} · {ROLE_LABEL[user.role]}
              </p>
            </div>
            <DropdownList>
              <DropdownLinkItem to="/guide" icon={Component} onClick={close}>
                UI 컴포넌트 가이드
              </DropdownLinkItem>
              <DropdownItem
                icon={RotateCcw}
                onClick={() => {
                  // close()가 초점을 트리거로 돌려준 뒤 모달을 연다 → 모달을 닫으면 트리거로 돌아온다.
                  close();
                  setConfirmOpen(true);
                }}
              >
                데모 데이터 초기화
              </DropdownItem>
            </DropdownList>
          </>
        )}
      </Dropdown>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
        }}
        onConfirm={() => {
          void resetDemoData();
        }}
        title="데모 데이터 초기화"
        confirmLabel="초기화"
        loading={resetting}
      >
        등록·수정·삭제한 리소스와 사용자, 알림 읽음 상태가 모두 처음 상태로 돌아갑니다. 이
        브라우저에 저장된 변경 내용은 되돌릴 수 없습니다.
      </ConfirmModal>
    </>
  );
}
