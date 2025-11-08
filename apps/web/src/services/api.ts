import { API_BASE_URL } from '../utils/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
