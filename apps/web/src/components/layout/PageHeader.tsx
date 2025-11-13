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
    <div className={`mb-8 md:mb-10 ${className}`}>
      <h1 className="text-2xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2 text-content-primary md:text-3xl">{title}</h1>
      <p className="text-base text-content-secondary">{description}</p>
    </div>
  )
}
