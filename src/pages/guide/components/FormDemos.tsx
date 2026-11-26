import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/Radio';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';

import styles from '../GuidePage.module.scss';

import { GuideExample, GuideSection } from './GuideSection';
import { useDemoAction } from './useDemoAction';

const PROVIDER_OPTIONS = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
];

export function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const demo = useDemoAction();

  return (
    <GuideSection id="button" title="Button">
      <GuideExample label="종류">
        <Button variant="primary" icon={Plus} onClick={demo('리소스 등록')}>
          리소스 등록
        </Button>
        <Button onClick={demo('취소')}>취소</Button>
        <Button variant="ghost" onClick={demo('초기화')}>
          초기화
        </Button>
        <Button variant="danger" icon={Trash2} onClick={demo('삭제')}>
          삭제
        </Button>
      </GuideExample>
      <GuideExample label="크기 (28 / 32 / 36px)">
        <Button size="sm" onClick={demo('작게')}>
          작게
        </Button>
        <Button size="md" onClick={demo('기본')}>
          기본
        </Button>
        <Button size="lg" onClick={demo('크게')}>
          크게
        </Button>
      </GuideExample>
      <GuideExample label="아이콘 단독 · 비활성">
        <Button iconOnly icon={RefreshCw} onClick={demo('새로고침')}>
          새로고침
        </Button>
        <Button variant="primary" disabled>
          저장
        </Button>
        <Button disabled>취소</Button>
      </GuideExample>
      <GuideExample label="처리 중 (누르면 2초간)">
        <Button
          variant="primary"
          loading={loading}
          onClick={() => {
            setLoading(true);
            window.setTimeout(() => {
              setLoading(false);
            }, 2000);
          }}
        >
          {loading ? '저장 중' : '저장'}
        </Button>
      </GuideExample>
      <GuideExample label="실행 불가 사유 안내 (aria-disabled: 초점은 받고 실행·폼 제출은 막힘)">
        <form
          className={styles.inlineForm}
          onSubmit={(event) => {
            event.preventDefault();
            demo('변경 사항 저장')();
          }}
        >
          <Input label="태그" defaultValue="production" />
          <Tooltip content="변경한 내용이 없어 저장할 수 없습니다.">
            <Button type="submit" variant="primary" aria-disabled>
              변경 사항 저장
            </Button>
          </Tooltip>
        </form>
      </GuideExample>
    </GuideSection>
  );
}

export function InputDemo() {
  const [name, setName] = useState('');
  const nameError = name.length > 0 && !/^[a-z0-9-]+$/.test(name);

  return (
    <GuideSection id="input" title="Input">
      <GuideExample label="기본 · 도움말">
        <Input
          label="리소스명"
          placeholder="예: web-prod-01"
          hint="영문 소문자, 숫자, 하이픈(-)만 사용합니다."
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
      <GuideExample label="필수 · 입력 검증 (대문자를 입력해 보세요)">
        <Input
          label="호스트 이름"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          error={nameError ? '영문 소문자, 숫자, 하이픈(-)만 입력할 수 있습니다.' : undefined}
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
      <GuideExample label="오류">
        <Input
          label="IP 주소"
          defaultValue="10.0.300.1"
          error="올바른 IPv4 주소 형식이 아닙니다. 예: 10.0.1.25"
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
      <GuideExample label="비활성 · 읽기 전용">
        <div className={styles.stack}>
          <Input
            label="리전"
            defaultValue="ap-northeast-2"
            disabled
            fieldClassName={styles.fullWidth}
          />
          <Input
            label="리소스 ID"
            defaultValue="i-0a1b2c3d4e5f67890"
            readOnly
            fieldClassName={styles.fullWidth}
          />
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function SelectDemo() {
  return (
    <GuideSection id="select" title="Select">
      <GuideExample label="기본 (필터)">
        <Select
          label="클라우드 제공업체"
          placeholder="전체"
          options={PROVIDER_OPTIONS}
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
      <GuideExample label="오류">
        <Select
          label="인스턴스 유형"
          required
          placeholder="선택하세요"
          options={[
            { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GiB)' },
            { value: 't3.large', label: 't3.large (2 vCPU, 8 GiB)' },
          ]}
          error="인스턴스 유형을 선택하세요."
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
      <GuideExample label="비활성">
        <Select
          label="리전"
          options={[{ value: 'ap-northeast-2', label: 'ap-northeast-2 (서울)' }]}
          disabled
          fieldClassName={styles.fullWidth}
        />
      </GuideExample>
    </GuideSection>
  );
}

export function CheckboxDemo() {
  const items = ['web-prod-01', 'web-prod-02', 'db-prod-01'];
  const [checked, setChecked] = useState<string[]>(['web-prod-01']);
  const allChecked = checked.length === items.length;

  return (
    <GuideSection id="checkbox" title="Checkbox">
      <GuideExample label="전체 선택 · 일부 선택">
        <div className={styles.stack}>
          <Checkbox
            label="전체 선택"
            checked={allChecked}
            indeterminate={checked.length > 0 && !allChecked}
            onChange={() => {
              setChecked(allChecked ? [] : items);
            }}
          />
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={checked.includes(item)}
              onChange={() => {
                setChecked((current) =>
                  current.includes(item)
                    ? current.filter((value) => value !== item)
                    : [...current, item],
                );
              }}
            />
          ))}
        </div>
      </GuideExample>
      <GuideExample label="비활성">
        <div className={styles.stack}>
          <Checkbox label="선택 안 됨" disabled />
          <Checkbox label="선택됨" disabled defaultChecked />
        </div>
      </GuideExample>
    </GuideSection>
  );
}

export function RadioDemo() {
  const [provider, setProvider] = useState('aws');
  const [backup, setBackup] = useState('');

  return (
    <GuideSection id="radio" title="Radio">
      <GuideExample label="기본 (화살표 키로 이동)">
        <RadioGroup
          legend="클라우드 제공업체"
          options={PROVIDER_OPTIONS}
          value={provider}
          onChange={setProvider}
        />
      </GuideExample>
      <GuideExample label="오류">
        <RadioGroup
          legend="백업 주기"
          required
          options={[
            { value: 'daily', label: '매일' },
            { value: 'weekly', label: '매주' },
          ]}
          value={backup}
          onChange={setBackup}
          error={backup ? undefined : '백업 주기를 선택하세요.'}
        />
      </GuideExample>
      <GuideExample label="일부 비활성">
        <RadioGroup
          legend="운영체제"
          options={[
            { value: 'linux', label: 'Linux' },
            { value: 'windows', label: 'Windows', disabled: true },
          ]}
          value="linux"
          onChange={() => undefined}
        />
      </GuideExample>
    </GuideSection>
  );
}

export function SwitchDemo() {
  const [monitoring, setMonitoring] = useState(true);

  return (
    <GuideSection id="switch" title="Switch">
      <GuideExample label="켜짐 · 꺼짐 (텍스트 병기)">
        <div className={styles.stack}>
          <Switch
            label="모니터링 활성화"
            checked={monitoring}
            onChange={(event) => {
              setMonitoring(event.target.checked);
            }}
          />
          <Switch label="자동 백업" defaultChecked={false} />
        </div>
      </GuideExample>
      <GuideExample label="비활성">
        <div className={styles.stack}>
          <Switch label="삭제 보호" disabled defaultChecked />
          <Switch label="공인 IP 할당" disabled />
        </div>
      </GuideExample>
    </GuideSection>
  );
}
