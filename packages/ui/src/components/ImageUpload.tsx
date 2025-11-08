import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { BaseComponentProps } from '@altread/types';

interface ImageUploadProps extends BaseComponentProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage?: File | null;
  preview?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  preview,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onImageSelect(imageFile);
    }
  }, [onImageSelect, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  }, [onImageSelect, disabled]);

  if (selectedImage || preview) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative group">
          <img
            src={preview || (selectedImage ? URL.createObjectURL(selectedImage) : '')}
            alt="Upload preview"
            className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm"
          />
          <button
            onClick={onImageRemove}
            disabled={disabled}
            className="absolute top-3 right-3 p-2 bg-gray-900 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
        isDragOver
          ? 'border-gray-300 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-gray-100 rounded-2xl">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-900 font-medium text-base">
            Drop an image here or click to browse
          </p>
          <p className="text-gray-500 text-sm">
            Supports JPG, PNG, GIF, and WebP formats
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
