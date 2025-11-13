import React, { useState, useRef, useEffect } from 'react'

export interface DropdownOption {
  value: string
  label: string
}

export interface CustomDropdownProps {
  label?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current.scrollHeight
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top

      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`flex flex-col overflow-visible ${className}`}>
      {label && (
        <label className="text-sm text-content-secondary mb-1.5 flex justify-between items-center">
          {label}
        </label>
      )}
      <div 
        ref={dropdownRef}
        className={`relative w-full ${disabled ? 'opacity-50' : ''}`}
      >
        <button
          type="button"
          className={`w-full px-2 py-3 min-h-[44px] border border-[var(--border)] rounded-sm bg-surface-primary text-base font-inherit text-content-primary cursor-pointer transition-all duration-100 flex items-center justify-between text-left hover:border-[var(--border-dark)] focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(35,131,226,0.14)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary md:px-2 md:py-1.5 md:min-h-auto ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : ''}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`flex-shrink-0 ml-2 text-content-tertiary transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
          >
            <path 
              d="M3 4.5L6 7.5L9 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            ref={menuRef}
            className={`absolute ${dropdownPosition === 'top' ? 'bottom-full mb-0.5' : 'top-full mt-0.5'} left-0 right-0 z-[9999] bg-surface-primary border border-[var(--border)] rounded-sm shadow-dropdown max-h-[200px] overflow-y-auto animate-[dropdownFadeIn_0.15s_ease] ${dropdownPosition === 'top' ? 'animate-[dropdownFadeInTop_0.15s_ease]' : ''}`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-3 py-2 border-none bg-transparent text-content-primary text-base font-inherit text-left cursor-pointer transition-all duration-100 flex items-center justify-between gap-2 hover:bg-surface-hover ${option.value === value ? 'bg-surface-secondary text-content-primary' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{option.label}</span>
                {option.value === value && (
                  <svg 
                    className="flex-shrink-0 text-accent"
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none"
                  >
                    <path 
                      d="M10 3L4.5 8.5L2 6" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
