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
    <div className={`stat-card ${className}`}>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  )
}

