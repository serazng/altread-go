import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AnalyticsData } from '@altread/types'

export interface VoiceUsageChartProps {
  data: AnalyticsData
  className?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
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
          {data.voiceName}
        </div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {data.count} {data.count === 1 ? 'play' : 'plays'} ({data.percentage.toFixed(1)}%)
        </div>
      </div>
    )
  }
  return null
}

export const VoiceUsageChart: React.FC<VoiceUsageChartProps> = ({
  data,
  className = ''
}) => {
  if (!data.voiceUsage || data.voiceUsage.length === 0) {
    return (
      <div className={`mb-4 md:mb-6 overflow-visible ${className}`}>
        <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Voice Usage</div>
        <div className="py-8 text-center text-content-secondary text-base">
          No voice usage data available for the selected time range
        </div>
      </div>
    )
  }

  // Reverse the array to show most used at top
  const chartData = [...data.voiceUsage].reverse()

  return (
    <div className={`mb-4 md:mb-6 overflow-visible ${className}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Voice Usage</div>
      <div className="w-full h-[200px] mt-3 p-3 bg-surface-secondary border border-[var(--border)] rounded-lg">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 60, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              type="category"
              dataKey="voiceName"
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 500 }}
              tickLine={{ stroke: 'var(--border)' }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="var(--accent)"
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

