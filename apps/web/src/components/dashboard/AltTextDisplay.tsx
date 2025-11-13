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
    <div className="bg-surface-secondary rounded-sm p-4 min-h-[200px] relative md:min-h-[280px]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[160px] md:min-h-[240px]">
          <div className="flex flex-col items-center justify-center text-center">
            <Spinner size="md" />
            <div className="mt-3 text-content-secondary text-base font-medium">
              {altText ? 'Regenerating alt text...' : 'Generating alt text...'}
            </div>
          </div>
        </div>
      ) : altText ? (
        <div className="text-base leading-normal text-content-primary flex items-center justify-center min-h-[160px] text-center p-3 md:leading-[1.7] md:min-h-[240px] md:p-4">{altText}</div>
      ) : (
        <div className="text-base leading-normal text-content-tertiary flex items-center justify-center min-h-[160px] text-center p-3 md:leading-[1.7] md:min-h-[240px] md:p-4">
          Upload an image and click Generate to create alt text
        </div>
      )}
    </div>
  )
}
