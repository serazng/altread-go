import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`bg-surface-secondary border border-[var(--border)] rounded-lg p-4 text-center transition-all duration-200 flex flex-col justify-center items-center hover:bg-surface-hover hover:border-[var(--border-dark)] sm:p-[18px] lg:p-5 ${className}`}>
      <div className="text-sm text-content-secondary font-medium mb-2 text-center sm:text-base">{title}</div>
      <div className="text-[28px] font-bold text-content-primary mb-1 leading-tight text-center sm:text-[30px] lg:text-[32px]">{value}</div>
      {subtitle && <div className="text-xs text-content-tertiary mt-1 text-center sm:text-sm">{subtitle}</div>}
    </div>
  )
}

