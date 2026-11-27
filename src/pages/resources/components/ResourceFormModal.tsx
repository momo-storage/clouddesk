import { CircleAlert } from 'lucide-react';
import { useId, useRef, useState, type SyntheticEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { PROVIDER_KEYS, PROVIDERS } from '@/constants/providers';
import type { CloudProvider, Resource, ResourceInput } from '@/types/resource';

import {
  getInitialFormValues,
  RESOURCE_FORM_FIELDS,
  toResourceInput,
  validateResourceForm,
  type ResourceFormErrors,
  type ResourceFormField,
  type ResourceFormValues,
} from '../resourceForm';
import styles from '../ResourceListPage.module.scss';

export interface ResourceFormModalProps {
  open: boolean;
  /** 수정할 리소스. null이면 등록 */
  resource: Resource | null;
  /** 같은 이름 검사용 전체 리소스 이름 */
  existingNames: readonly string[];
  onClose: () => void;
  /** 저장. 실패하면 오류를 던진다(폼 위에 메시지를 보여준다). */
  onSubmit: (input: ResourceInput) => Promise<void>;
  /** 실행 요소가 사라졌을 때 초점을 받을 요소 */
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * 리소스 등록·수정 모달(하나의 폼을 함께 쓴다, 설계서 3-2).
 * 열 때마다 새로 마운트되도록 사용처에서 key를 바꿔 준다(입력값·오류 상태 초기화).
 *
 * - 검증은 제출할 때 하고, 한 번 제출한 뒤에는 입력할 때마다 다시 검사해 오류가 고쳐졌는지 바로 보여준다.
 * - 제출 실패 시 첫 오류 칸으로 초점을 옮긴다. 오류 문구는 aria-describedby로 각 칸에 연결된다(Input·Select).
 * - 제공업체를 바꾸면 리전·인스턴스 유형·운영체제 선택지가 바뀌므로 그 값들을 비운다.
 */
export function ResourceFormModal({
  open,
  resource,
  existingNames,
  onClose,
  onSubmit,
  fallbackFocus,
}: ResourceFormModalProps) {
  const formId = useId();
  const fieldIdPrefix = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ResourceFormValues>(() => getInitialFormValues(resource));
  const [errors, setErrors] = useState<ResourceFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = resource !== null;
  const provider = PROVIDERS[values.provider];
  const otherNames = new Set(existingNames.filter((name) => name !== resource?.name));
  const fieldId = (field: ResourceFormField) => `${fieldIdPrefix}-${field}`;

  const update = (patch: Partial<ResourceFormValues>) => {
    const next = { ...values, ...patch };
    setValues(next);
    if (submitted) setErrors(validateResourceForm(next, otherNames));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validateResourceForm(values, otherNames);
    setErrors(nextErrors);
    setSubmitted(true);
    setFormError(null);

    const firstInvalid = RESOURCE_FORM_FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setSaving(true);
    try {
      await onSubmit(toResourceInput(values));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : '저장하지 못했습니다. 다시 시도하세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '리소스 수정' : '리소스 등록'}
      description={
        <>
          <span aria-hidden="true">* </span>표시는 필수 항목입니다. 변경 내용은 이 브라우저의 데모
          데이터에만 저장됩니다.
        </>
      }
      size="md"
      initialFocus={() => nameRef.current}
      fallbackFocus={fallbackFocus}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" form={formId} variant="primary" loading={saving}>
            {isEdit ? '저장' : '등록'}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        {formError && (
          <p role="alert" className={styles.formError}>
            <CircleAlert size={16} aria-hidden="true" />
            {formError}
          </p>
        )}

        <Input
          ref={nameRef}
          id={fieldId('name')}
          label="리소스명"
          required
          autoComplete="off"
          spellCheck={false}
          value={values.name}
          hint="소문자·숫자·하이픈(-) 3~40자(예: prod-web-01)"
          error={errors.name}
          onChange={(event) => {
            update({ name: event.target.value });
          }}
        />

        <Select
          id={fieldId('provider')}
          label="클라우드 제공업체"
          required
          disabled={isEdit}
          value={values.provider}
          options={PROVIDER_KEYS.map((key) => ({ value: key, label: PROVIDERS[key].label }))}
          hint={isEdit ? '제공업체는 등록한 뒤에 바꿀 수 없습니다.' : undefined}
          onChange={(event) => {
            update({
              provider: event.target.value as CloudProvider,
              region: '',
              instanceType: '',
              os: '',
            });
          }}
        />

        <div className={styles.formRow}>
          <Select
            id={fieldId('region')}
            label="리전"
            required
            placeholder="선택하세요"
            value={values.region}
            options={provider.regions.map((region) => ({
              value: region.code,
              label: `${region.code} · ${region.label}`,
            }))}
            error={errors.region}
            onChange={(event) => {
              update({ region: event.target.value });
            }}
          />
          <Select
            id={fieldId('instanceType')}
            label="인스턴스 유형"
            required
            placeholder="선택하세요"
            value={values.instanceType}
            options={provider.instanceTypes.map((type) => ({
              value: type.name,
              label: `${type.name} · ${String(type.vcpu)} vCPU, ${String(type.memoryGib)} GiB`,
            }))}
            error={errors.instanceType}
            onChange={(event) => {
              update({ instanceType: event.target.value });
            }}
          />
        </div>

        <Select
          id={fieldId('os')}
          label="운영체제"
          required
          placeholder="선택하세요"
          value={values.os}
          options={provider.osOptions.map((os) => ({ value: os, label: os }))}
          error={errors.os}
          onChange={(event) => {
            update({ os: event.target.value });
          }}
        />

        <div className={styles.formRow}>
          <Input
            id={fieldId('privateIp')}
            label="사설 IP 주소"
            required
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={values.privateIp}
            hint="예: 10.0.1.25"
            error={errors.privateIp}
            className={styles.monoInput}
            onChange={(event) => {
              update({ privateIp: event.target.value });
            }}
          />
          <Input
            id={fieldId('publicIp')}
            label="공인 IP 주소(선택)"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={values.publicIp}
            hint="없으면 비워 둡니다."
            error={errors.publicIp}
            className={styles.monoInput}
            onChange={(event) => {
              update({ publicIp: event.target.value });
            }}
          />
        </div>

        <Switch
          label="모니터링 수집"
          checked={values.monitoringEnabled}
          onChange={(event) => {
            update({ monitoringEnabled: event.target.checked });
          }}
        />
      </form>
    </Modal>
  );
}
