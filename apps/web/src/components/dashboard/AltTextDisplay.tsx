import React from 'react'
import { Spinner } from '../ui'

export interface AltTextDisplayProps {
  altText: string
  isLoading: boolean
}

export const AltTextDisplay: React.FC<AltTextDisplayProps> = ({
  altText,
  isLoading
}) => {
  return (
    <div className="text-output-block">
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-content">
            <Spinner size="md" />
            <div className="loading-text">
              {altText ? 'Regenerating alt text...' : 'Generating alt text...'}
            </div>
          </div>
        </div>
      ) : altText ? (
        <div className="generated-text">{altText}</div>
      ) : (
        <div className="generated-text" style={{ color: '#9b9a97' }}>
          Upload an image and click Generate to create alt text
        </div>
      )}
    </div>
  )
}
