import React from 'react'

export interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`block ${className}`}>
      {title && (
        <div className="block-title">
          {title}
        </div>
      )}
      {description && (
        <p className="text-sm text-secondary mb-4">{description}</p>
      )}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {children}
      </div>
    </div>
  )
}
