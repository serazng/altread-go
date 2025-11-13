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
    <div className="flex flex-col overflow-visible">
      {label && (
        <label className="text-sm text-content-secondary mb-1.5 flex justify-between items-center">
          {label}
          <span className="font-medium text-content-primary">
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
        className={`w-full h-0.5 bg-[var(--border)] rounded-[1px] outline-none transition-colors duration-100 hover:bg-[var(--border-dark)] appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-content-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-100 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:bg-accent ${className}`}
        {...props}
      />
    </div>
  )
}
