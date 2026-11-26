/** 조건부 클래스 이름을 합친다. false·null·undefined·빈 문자열은 제외한다. */
export function cn(...classNames: (string | false | null | undefined)[]): string {
  return classNames.filter(Boolean).join(' ');
}
