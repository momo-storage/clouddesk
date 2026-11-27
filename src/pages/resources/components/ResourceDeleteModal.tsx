import { ConfirmModal } from '@/components/ui/Modal';
import type { Resource } from '@/types/resource';
import { formatNumber } from '@/utils/format';

import styles from '../ResourceListPage.module.scss';

/** 삭제 확인 모달에 이름을 모두 나열하는 최대 개수 */
const NAME_LIMIT = 5;

export interface ResourceDeleteModalProps {
  open: boolean;
  /** 삭제할 리소스. 여러 개면 선택 삭제 문구로 보여준다. */
  targets: Resource[];
  /** 목록의 "선택 삭제"처럼 여러 개를 고른 삭제인지(대상이 하나여도 선택 삭제 문구를 쓴다) */
  bulk?: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fallbackFocus?: () => HTMLElement | null;
}

/** 리소스 삭제 확인(목록의 단건·선택 삭제, 상세의 삭제가 함께 쓴다). 초기 초점은 "취소"다. */
export function ResourceDeleteModal({
  open,
  targets,
  bulk = false,
  loading,
  onClose,
  onConfirm,
  fallbackFocus,
}: ResourceDeleteModalProps) {
  const [first] = targets;

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={bulk ? '선택한 리소스 삭제' : '리소스 삭제'}
      confirmLabel="삭제"
      loading={loading}
      fallbackFocus={fallbackFocus}
    >
      {bulk ? (
        <>
          <p>선택한 리소스 {formatNumber(targets.length)}개를 삭제하시겠습니까?</p>
          <ul className={styles.deleteList}>
            {targets.slice(0, NAME_LIMIT).map((resource) => (
              <li key={resource.id}>{resource.name}</li>
            ))}
            {targets.length > NAME_LIMIT && (
              <li>외 {formatNumber(targets.length - NAME_LIMIT)}개</li>
            )}
          </ul>
        </>
      ) : (
        <p>
          <strong className={styles.deleteName}>{first?.name}</strong>{' '}
          <span className={styles.mono}>({first?.id})</span> 리소스를 삭제하시겠습니까?
        </p>
      )}
      <p className={styles.deleteNote}>
        데모 데이터에서만 삭제되며, 사용자 메뉴의 &lsquo;데모 데이터 초기화&rsquo;로 되돌릴 수
        있습니다.
      </p>
    </ConfirmModal>
  );
}
