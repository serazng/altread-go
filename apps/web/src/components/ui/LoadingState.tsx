import React from 'react'

export interface LoadingStateProps {
  type?: 'skeleton' | 'spinner' | 'dots'
  message?: string
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'skeleton',
  message = 'Loading...',
  className = ''
}) => {
  if (type === 'spinner') {
    return (
      <div className={`loading-spinner ${className}`}>
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={`loading-dots ${className}`}>
        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    )
  }

  return (
    <div className={`loading-skeleton ${className}`}>
      <div className="skeleton-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-shimmer">
              <div className="skeleton-line skeleton-line--short"></div>
              <div className="skeleton-line skeleton-line--long"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-chart">
        <div className="skeleton-shimmer">
          <div className="skeleton-line skeleton-line--title"></div>
          <div className="skeleton-bars">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton-bar" style={{ height: `${60 + Math.random() * 40}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
