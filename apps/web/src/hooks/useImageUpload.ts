import { useState, useCallback } from 'react'

export const useImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [altText, setAltText] = useState<string>('')

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file)
    setAltText('')
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null)
    setPreview('')
    setAltText('')
  }, [])

  const setGeneratedAltText = useCallback((text: string) => {
    setAltText(text)
  }, [])

  return {
    selectedImage,
    preview,
    altText,
    handleImageSelect,
    handleImageRemove,
    setGeneratedAltText
  }
}
