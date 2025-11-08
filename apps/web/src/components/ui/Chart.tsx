import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export interface ChartSeries {
  name: string
  data: number[]
  color?: string
}

export interface ChartProps {
  title?: string
  series: ChartSeries[]
  xAxisLabels?: string[]
  height?: number
  className?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[120px]">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.dataKey}:
            </span> {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const Chart: React.FC<ChartProps> = ({
  title,
  series,
  xAxisLabels = [],
  height = 300,
  className = ''
}) => {
  const chartData = series[0]?.data.map((_, index) => {
    const dataPoint: any = {}
    series.forEach(s => {
      dataPoint[s.name] = s.data[index]
    })
    if (xAxisLabels[index]) {
      dataPoint.name = xAxisLabels[index]
    }
    return dataPoint
  }) || []

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e9e9e7" 
              vertical={false}
            />
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#787774',
                fontWeight: 500
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#787774',
                fontWeight: 500
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {series.map((s, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={s.name}
                stroke={s.color || '#2383e2'}
                strokeWidth={2}
                dot={{ 
                  fill: s.color || '#2383e2', 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  fill: s.color || '#2383e2',
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}