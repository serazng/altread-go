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

export const VoiceUsageChart: React.FC<VoiceUsageChartProps> = ({
  data,
  className = ''
}) => {
  if (!data.voiceUsage || data.voiceUsage.length === 0) {
    return (
      <div className={`block ${className}`}>
        <div className="block-title">Voice Usage</div>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No voice usage data available for the selected time range
        </div>
      </div>
    )
  }

  // Reverse the array to show most used at top
  const chartData = [...data.voiceUsage].reverse()

  return (
    <div className={`block ${className}`}>
      <div className="block-title">Voice Usage</div>
      <div style={{ width: '100%', height: '300px', marginTop: '16px' }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey="voiceName"
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} (${props.payload.percentage.toFixed(1)}%)`,
                'Usage',
              ]}
            />
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

