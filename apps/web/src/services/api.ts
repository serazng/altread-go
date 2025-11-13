import { API_BASE_URL } from '../utils/api'
import { AnalyticsData, TimeRange } from '@altread/types'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export const getAnalytics = async (timeRange: TimeRange): Promise<AnalyticsData> => {
  const response = await fetch(`${API_BASE_URL}/analytics?timeRange=${timeRange}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const result: ApiResponse<AnalyticsData> = await response.json()

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch analytics data')
  }

  return result.data
}
