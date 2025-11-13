import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-sm text-base font-medium font-inherit cursor-pointer transition-all duration-100 border-none gap-1.5 whitespace-nowrap min-h-[44px] px-4 py-3 md:min-h-auto md:px-3 md:py-1.5'
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-transparent text-content-primary hover:bg-surface-hover active:bg-[var(--border)]',
    outline: 'bg-transparent text-content-primary border border-[var(--border)] hover:border-[var(--border-dark)]'
  }
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-[var(--border)] border-t-content-tertiary rounded-full animate-spin mr-2"></div>
      )}
      {children}
    </button>
  )
}
