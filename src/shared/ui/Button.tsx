/**
 * 공용 버튼 컴포넌트
 *
 * variant, size 옵션 제공
 */
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  // 기본 스타일
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant별 스타일
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-brand-primary-500 to-brand-accent-emerald text-white shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-green-500/30',
    secondary:
      'bg-brand-primary-100 text-brand-primary-900 hover:bg-brand-primary-200',
    outline:
      'border-2 border-brand-primary-500 text-brand-primary-500 hover:bg-brand-primary-50',
    ghost: 'text-brand-primary-500 hover:bg-brand-primary-50',
  }

  // Size별 스타일
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  )
}
