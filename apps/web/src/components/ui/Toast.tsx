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
    success: 'status-success',
    error: 'status-error',
    info: 'status-toast'
  }

  return (
    <div className={`status-toast ${typeClasses[type]}`}>
      {message}
    </div>
  )
}
