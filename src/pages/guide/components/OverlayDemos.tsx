import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { Dropdown, DropdownItem, DropdownList } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { useToast } from '@/store/toast/toastContext';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';

export function ModalDemo() {
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  // ESC·닫기 버튼(onClose)과 하단 "취소" 버튼이 같은 처리를 쓴다. 어느 쪽으로 닫아도 한 번만 실행된다.
  const cancelEdit = () => {
    setFormOpen(false);
    showToast('리소스 수정을 취소했습니다. (가이드 예시)', 'info');
  };

  return (
    <GuideSection id="modal" title="Modal">
      <GuideExample label="입력 폼 (배경 클릭으로 닫히지 않음, 첫 입력에 초점)">
        <Button
          variant="primary"
          onClick={() => {
            setFormOpen(true);
          }}
        >
          리소스 수정 열기
        </Button>
        <Modal
          open={formOpen}
          onClose={cancelEdit}
          title="리소스 수정"
          description="변경한 내용은 저장 후 목록에 반영됩니다."
          initialFocus={() => nameRef.current}
          footer={
            <>
              <Button onClick={cancelEdit}>취소</Button>
              {/* 하단 버튼은 form 밖에 있으므로 form 속성으로 본문의 폼과 연결한다. */}
              <Button type="submit" form={formId} variant="primary">
                저장
              </Button>
            </>
          }
        >
          <form
            id={formId}
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              setFormOpen(false);
              showToast('리소스를 수정했습니다. (가이드 예시)');
            }}
          >
            <Input ref={nameRef} label="리소스명" defaultValue="web-prod-01" required />
            <Select
              label="인스턴스 유형"
              defaultValue="t3.medium"
              options={[
                { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GiB)' },
                { value: 't3.large', label: 't3.large (2 vCPU, 8 GiB)' },
              ]}
            />
          </form>
        </Modal>
      </GuideExample>
      <GuideExample label="삭제 확인 (초기 초점: 취소)">
        <Button
          variant="danger"
          icon={Trash2}
          onClick={() => {
            setConfirmOpen(true);
          }}
        >
          삭제 확인 열기
        </Button>
        <ConfirmModal
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
          }}
          onConfirm={() => {
            setConfirmOpen(false);
            showToast('web-prod-01을 삭제했습니다. (가이드 예시)');
          }}
          title="리소스 삭제"
          confirmLabel="삭제"
        >
          <strong>web-prod-01</strong> 리소스를 삭제합니다. 삭제한 리소스는 되돌릴 수 없습니다.
        </ConfirmModal>
      </GuideExample>
    </GuideSection>
  );
}

export function DropdownDemo() {
  const { showToast } = useToast();

  return (
    <GuideSection id="dropdown" title="Dropdown">
      <GuideExample label="행 더보기 메뉴 (ESC·바깥 클릭으로 닫힘)">
        <Dropdown
          triggerClassName={getButtonClassName({ variant: 'ghost', iconOnly: true })}
          trigger={
            <>
              <MoreHorizontal size={16} aria-hidden="true" />
              <VisuallyHidden>web-prod-01 작업 더보기</VisuallyHidden>
            </>
          }
        >
          {(close) => (
            <DropdownList>
              <DropdownItem
                icon={Pencil}
                onClick={() => {
                  close();
                  showToast('수정을 선택했습니다. (가이드 예시)', 'info');
                }}
              >
                수정
              </DropdownItem>
              <DropdownItem
                icon={Trash2}
                tone="danger"
                onClick={() => {
                  close();
                  showToast('삭제를 선택했습니다. (가이드 예시)', 'info');
                }}
              >
                삭제
              </DropdownItem>
            </DropdownList>
          )}
        </Dropdown>
      </GuideExample>
    </GuideSection>
  );
}

export function ToastDemo() {
  const { showToast } = useToast();

  return (
    <GuideSection id="toast" title="Toast">
      <GuideExample label="처리 결과 알림 (5초 후 닫힘, 호버·초점 중 일시정지)" wide>
        <Button
          onClick={() => {
            showToast('리소스를 등록했습니다.', 'success');
          }}
        >
          성공 알림
        </Button>
        <Button
          onClick={() => {
            showToast('리소스를 삭제하지 못했습니다. 잠시 후 다시 시도하세요.', 'error');
          }}
        >
          오류 알림
        </Button>
        <Button
          onClick={() => {
            showToast('데모 데이터는 이 브라우저에만 저장됩니다.', 'info');
          }}
        >
          안내 알림
        </Button>
      </GuideExample>
    </GuideSection>
  );
}
