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
    <div className={`setting-item ${className}`}>
      {label && (
        <label className="setting-label">
          {label}
        </label>
      )}
      <div 
        ref={dropdownRef}
        className={`custom-dropdown ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      >
        <button
          type="button"
          className="dropdown-trigger"
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="dropdown-value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
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
            className={`dropdown-menu ${dropdownPosition === 'top' ? 'dropdown-menu-top' : ''}`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="option-label">{option.label}</span>
                {option.value === value && (
                  <svg 
                    className="check-icon"
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
