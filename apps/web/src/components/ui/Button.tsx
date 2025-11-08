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
  const baseClasses = 'button'
  const variantClasses = {
    primary: 'button-primary',
    secondary: '',
    outline: 'button-outline'
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
    isLoading ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="spinner mr-2" style={{ width: '16px', height: '16px' }}></div>
      )}
      {children}
    </button>
  )
}
