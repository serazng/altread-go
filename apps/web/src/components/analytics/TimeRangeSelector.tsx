import React from 'react'
import { TimeRange } from '@altread/types'
import { CustomDropdown, DropdownOption } from '../ui'

export interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
  className?: string
}

const timeRangeOptions: DropdownOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={className}>
      <CustomDropdown
        label="Time Range"
        options={timeRangeOptions}
        value={value}
        onChange={(val) => onChange(val as TimeRange)}
      />
    </div>
  )
}

