import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { cn } from '@/utils/cn';

import {
  buttonIconClassName,
  buttonSpinnerClassName,
  getButtonClassName,
  type ButtonStyleOptions,
} from './buttonClassName';

interface ButtonContentProps {
  icon?: LucideIcon;
  iconOnly?: boolean;
  loading?: boolean;
  children: ReactNode;
}

function ButtonContent({ icon: Icon, iconOnly, loading, children }: ButtonContentProps) {
  const iconElement = loading ? (
    <LoaderCircle className={cn(buttonIconClassName, buttonSpinnerClassName)} aria-hidden="true" />
  ) : (
    Icon && <Icon className={buttonIconClassName} aria-hidden="true" />
  );

  return (
    <>
      {iconElement}
      {iconOnly ? <VisuallyHidden>{children}</VisuallyHidden> : children}
    </>
  );
}

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'children'>, ButtonStyleOptions {
  /** 버튼 이름. iconOnly여도 반드시 넣는다(접근 가능한 이름). */
  children: ReactNode;
  icon?: LucideIcon;
  /**
   * 처리 중 상태. disabled 대신 aria-disabled로 표시하고 클릭을 무시한다.
   * disabled로 바꾸면 누른 버튼에서 초점이 사라지기 때문이다.
   * 실행할 수 없는 이유를 Tooltip으로 알려야 하는 버튼도 disabled 대신 aria-disabled를 쓴다(초점을 받아야 하므로).
   */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  iconOnly,
  icon,
  loading = false,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  // 초점은 유지하되 실행은 막는 상태: 처리 중(loading)이거나 사용처에서 aria-disabled를 준 경우
  const ariaDisabled = props['aria-disabled'];
  const blocked = loading || ariaDisabled === true || ariaDisabled === 'true';

  // 마우스 클릭, Enter·Space, 폼 안에서 Enter로 하는 암시적 제출 모두 click 이벤트로 들어온다.
  // preventDefault로 type="submit"의 폼 제출까지 막는다.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...props}
      type={type}
      className={cn(getButtonClassName({ variant, size, iconOnly }), className)}
      aria-busy={loading || undefined}
      aria-disabled={blocked || undefined}
      onClick={handleClick}
    >
      <ButtonContent icon={icon} iconOnly={iconOnly} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
}

export interface ButtonLinkProps extends Omit<LinkProps, 'children'>, ButtonStyleOptions {
  children: ReactNode;
  icon?: LucideIcon;
}

/** 페이지 이동은 링크로 하되 버튼 모양이 필요할 때 쓴다(예: "대시보드로 이동"). */
export function ButtonLink({
  variant,
  size,
  iconOnly,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link {...props} className={cn(getButtonClassName({ variant, size, iconOnly }), className)}>
      <ButtonContent icon={icon} iconOnly={iconOnly}>
        {children}
      </ButtonContent>
    </Link>
  );
}
