import React from 'react'

export interface GridItemProps {
  span?: number
  className?: string
  children: React.ReactNode
}

export const GridItem: React.FC<GridItemProps> = ({
  span = 1,
  className = '',
  children
}) => {
  const spanClass = span > 1 ? `col-span-${span}` : ''
  
  return (
    <div className={`${spanClass} ${className}`}>
      {children}
    </div>
  )
}
