import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AnalyticsData } from '@altread/types'

export interface ImageProcessingChartProps {
  data: AnalyticsData
  className?: string
}

export const ImageProcessingChart: React.FC<ImageProcessingChartProps> = ({
  data,
  className = ''
}) => {
  if (!data.imagesOverTime || data.imagesOverTime.length === 0) {
    return (
      <div className={`block ${className}`}>
        <div className="block-title">Images Processed Over Time</div>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No data available for the selected time range
        </div>
      </div>
    )
  }

  return (
    <div className={`block ${className}`}>
      <div className="block-title">Images Processed Over Time</div>
      <div style={{ width: '100%', height: '300px', marginTop: '16px' }}>
        <ResponsiveContainer>
          <AreaChart
            data={data.imagesOverTime}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--accent)"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

