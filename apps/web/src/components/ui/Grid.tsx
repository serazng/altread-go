import React from 'react'

export interface GridProps {
  cols?: number | 'auto'
  gap?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

export const Grid: React.FC<GridProps> = ({
  cols = 'auto',
  gap = 'md',
  className = '',
  children
}) => {
  const gridCols = typeof cols === 'number' ? `grid-cols-${cols}` : 'grid-cols-auto'
  const gridGap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }[gap]

  return (
    <div className={`grid ${gridCols} ${gridGap} ${className}`}>
      {children}
    </div>
  )
}
