export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export const API_BASE_URL_NO_PATH = (() => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
  if (url.endsWith('/api/v1')) {
    return url.replace('/api/v1', '')
  }
  return url.includes('/api/v1') ? url.replace('/api/v1', '') : 'http://localhost:3001'
})()

