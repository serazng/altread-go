import React from 'react'
import { Button } from '../ui'

export interface GenerateButtonProps {
  selectedImage: File | null
  altText: string
  isLoading: boolean
  onGenerate: () => void
  onClear: () => void
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  selectedImage,
  altText,
  isLoading,
  onGenerate,
  onClear
}) => {
  if (!selectedImage) return null

  return (
    <div className="button-group" style={{ marginTop: '16px', textAlign: 'center' }}>
      <Button
        variant="primary"
        onClick={onGenerate}
        isLoading={isLoading}
        size="lg"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {altText ? (
            <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          ) : (
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          )}
        </svg>
        {altText ? 'Regenerate Alt Text' : 'Generate Alt Text'}
      </Button>
      {altText && (
        <Button
          onClick={onClear}
          size="lg"
        >
          Clear Image
        </Button>
      )}
    </div>
  )
}
