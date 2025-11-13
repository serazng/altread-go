import React, { useState } from 'react'
import { TimeRange } from '@altread/types'
import { PageHeader } from '../components/layout'
import {
  StatCard,
  TimeRangeSelector,
  ImageProcessingChart,
  VoiceUsageChart,
} from '../components/analytics'
import { useAnalytics } from '../hooks'
import { LoadingState, Toast } from '../components/ui'

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const { data, isLoading, error } = useAnalytics(timeRange)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="View statistics about image processing and voice usage"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <LoadingState type="spinner" message="Loading analytics..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="View statistics about image processing and voice usage"
        />
        <Toast
          message={error instanceof Error ? error.message : 'Failed to load analytics data'}
          type="error"
          onClose={() => {}}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="View statistics about image processing and voice usage"
        />
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No analytics data available
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="View statistics about image processing and voice usage"
      />

      <div className="content-section" style={{ display: 'block' }}>
        <div className="block" style={{ marginBottom: '24px' }}>
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>

        <div className="stats-grid">
          <StatCard
            title="Total Images Processed"
            value={formatNumber(data.totalImagesProcessed)}
            subtitle={`${formatNumber(data.totalSuccessful)} successful, ${formatNumber(data.totalFailed)} failed`}
          />
          <StatCard
            title="Total Voice Plays"
            value={formatNumber(data.totalVoicePlays)}
          />
          <StatCard
            title="Success Rate"
            value={formatPercentage(data.successRate)}
          />
          <StatCard
            title="Avg Processing Time"
            value={formatTime(data.averageProcessingTime)}
          />
        </div>

        <ImageProcessingChart data={data} />

        <VoiceUsageChart data={data} />
      </div>
    </div>
  )
}

