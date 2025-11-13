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
      <div className={`flex flex-col items-center justify-center py-[60px] px-5 ${className}`}>
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="text-content-secondary text-base font-medium m-0">{message}</p>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center py-[60px] px-5 ${className}`}>
        <div className="flex gap-1.5 mb-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1.4s_ease-in-out_infinite_both] [animation-delay:-0.32s]"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1.4s_ease-in-out_infinite_both] [animation-delay:-0.16s]"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1.4s_ease-in-out_infinite_both]"></div>
        </div>
        <p className="text-content-secondary text-base font-medium m-0">{message}</p>
      </div>
    )
  }

  return (
    <div className={`py-5 ${className}`}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-[30px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-lg p-5 overflow-hidden">
            <div className="relative overflow-hidden">
              <div className="h-4 w-[60%] bg-surface-secondary rounded mb-2 relative z-[1]"></div>
              <div className="h-6 w-[40%] bg-surface-secondary rounded relative z-[1]"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[var(--border)] rounded-lg p-5 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="h-5 w-[30%] bg-surface-secondary rounded mb-5 relative z-[1]"></div>
          <div className="flex items-end gap-3 h-[120px] px-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 bg-surface-secondary rounded-t relative z-[1]" style={{ height: `${60 + Math.random() * 40}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
