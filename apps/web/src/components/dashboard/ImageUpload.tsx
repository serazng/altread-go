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
    <div className="block">
      <div className="block-title">Upload Image</div>
      <div 
        className="upload-zone"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <div className="upload-zone-text">Click to upload or drag and drop</div>
        <div className="upload-zone-subtext">PNG, JPG, GIF, WebP up to 10MB</div>
      </div>
      <input 
        type="file" 
        id="fileInput" 
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
