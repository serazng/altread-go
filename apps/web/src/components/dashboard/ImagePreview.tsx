import React from 'react'

export interface ImagePreviewProps {
  selectedImage: File | null
  preview: string
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  selectedImage,
  preview
}) => {
  return (
    <div className="image-block">
      {selectedImage || preview ? (
        <img 
          src={preview || (selectedImage ? URL.createObjectURL(selectedImage) : '')} 
          className="image-preview" 
          alt="Uploaded image" 
        />
      ) : (
        <div style={{ textAlign: 'center', color: '#9b9a97', fontSize: '14px' }}>
          <div style={{ marginBottom: '12px' }}>📷</div>
          <div>No image uploaded</div>
        </div>
      )}
    </div>
  )
}
