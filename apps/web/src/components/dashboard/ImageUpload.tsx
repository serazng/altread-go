import React from 'react'

export interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  preview: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="mb-4 md:mb-6 overflow-visible">
      <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Upload Image</div>
      <div 
        className="border border-[var(--border)] rounded-sm py-6 px-6 text-center transition-all duration-150 cursor-pointer bg-surface-primary hover:bg-surface-hover hover:border-[var(--border-dark)] md:py-12 md:px-6"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <svg className="inline-block w-6 h-6 mb-3 opacity-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <div className="text-base text-content-primary mb-1">Click to upload or drag and drop</div>
        <div className="text-sm text-content-tertiary">PNG, JPG, GIF, WebP up to 10MB</div>
      </div>
      <input 
        type="file" 
        id="fileInput" 
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
