import React from 'react'

export interface PageHeaderProps {
  title: string
  description: string
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className = ''
}) => {
  return (
    <div className={`page-header ${className}`}>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  )
}
