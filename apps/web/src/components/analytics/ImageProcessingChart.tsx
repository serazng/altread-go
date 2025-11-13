import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts'
import { AnalyticsData } from '@altread/types'

export interface ImageProcessingChartProps {
  data: AnalyticsData
  className?: string
}

const CustomDot = (props: any) => {
  const { cx, cy } = props
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill="var(--accent)"
      stroke="var(--bg-primary)"
      strokeWidth={2}
    />
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
        }}
      >
        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {payload[0].value} {payload[0].value === 1 ? 'image' : 'images'}
        </div>
      </div>
    )
  }
  return null
}

export const ImageProcessingChart: React.FC<ImageProcessingChartProps> = ({
  data,
  className = ''
}) => {
  if (!data.imagesOverTime || data.imagesOverTime.length === 0) {
    return (
      <div className={`mb-4 md:mb-6 overflow-visible mt-6 ${className}`}>
        <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Images Processed Over Time</div>
        <div className="py-8 text-center text-content-secondary text-base">
          No data available for the selected time range
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-4 md:mb-6 overflow-visible mt-6 ${className}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Images Processed Over Time</div>
      <div className="w-full h-[200px] mt-3 p-3 bg-surface-secondary border border-[var(--border)] rounded-lg">
        <ResponsiveContainer>
          <LineChart
            data={data.imagesOverTime}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border)' }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border)' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 5, fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

