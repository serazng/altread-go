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
    <div className="bg-surface-secondary rounded-sm p-3 flex items-center justify-center min-h-[200px] max-h-[300px] overflow-hidden md:min-h-[280px] md:max-h-[360px]">
      {selectedImage || preview ? (
        <img 
          src={preview || (selectedImage ? URL.createObjectURL(selectedImage) : '')} 
          className="max-w-full max-h-full h-auto block rounded-sm" 
          alt="Uploaded image" 
        />
      ) : (
        <div className="text-center text-content-tertiary text-base">
          <div className="mb-3">📷</div>
          <div>No image uploaded</div>
        </div>
      )}
    </div>
  )
}
