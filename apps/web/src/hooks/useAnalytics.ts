import { useQuery } from '@tanstack/react-query'
import { AnalyticsData, TimeRange } from '@altread/types'
import { API_BASE_URL } from '../utils/api'

interface AnalyticsResponse {
  success: boolean
  data?: AnalyticsData
  error?: string
}

const fetchAnalytics = async (timeRange: TimeRange): Promise<AnalyticsData> => {
  const response = await fetch(`${API_BASE_URL}/analytics?timeRange=${timeRange}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const result: AnalyticsResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch analytics data')
  }

  return result.data
}

export const useAnalytics = (timeRange: TimeRange = '30d') => {
  return useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => fetchAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

