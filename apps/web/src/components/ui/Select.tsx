import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helpText?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col overflow-visible">
      {label && (
        <label className="text-sm text-content-secondary mb-1.5 flex justify-between items-center">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-2 py-3 min-h-[44px] border border-[var(--border)] rounded-sm bg-surface-primary text-base font-inherit text-content-primary cursor-pointer transition-all duration-100 hover:border-[var(--border-dark)] focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(35,131,226,0.14)] md:px-2 md:py-1.5 md:min-h-auto ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="text-xs text-content-tertiary mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
