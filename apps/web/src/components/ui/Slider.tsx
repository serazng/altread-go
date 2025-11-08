import React from 'react'

export interface SliderProps {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  onChange,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <div className="setting-item">
      {label && (
        <label className="setting-label">
          {label}
          <span className="setting-value">
            {unit === '%' ? Math.round(value * 100) + unit : value.toFixed(1) + unit}
          </span>
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`slider ${className}`}
        {...props}
      />
    </div>
  )
}
