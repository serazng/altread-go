import React, { useEffect } from 'react'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeClasses = {
    success: 'bg-surface-primary text-content-primary border border-[var(--border)]',
    error: 'bg-[#fef3f2] text-[#d92b2b] border border-[#fee4e2]',
    info: 'bg-surface-primary text-content-primary border border-[var(--border)]'
  }

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-sm text-base shadow-[0_2px_8px_rgba(0,0,0,0.12)] animate-[slideUp_0.2s_ease] z-[1000] ${typeClasses[type]}`}>
      {message}
    </div>
  )
}
