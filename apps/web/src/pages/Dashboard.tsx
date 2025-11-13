import React, { useCallback, useEffect } from 'react'
import { 
  ImageUpload, 
  ImagePreview, 
  AltTextDisplay, 
  VoiceControls, 
  VoiceSettings, 
  GenerateButton,
  PageHeader
} from '../components'
import { useImageUpload } from '../hooks/useImageUpload'
import { useVoiceSettings } from '../hooks/useVoiceSettings'
import { useOpenAITTS } from '../hooks/useOpenAITTS'
import { useApi } from '../hooks/useApi'
import { Toast, LoadingState } from '../components/ui'

export const Dashboard: React.FC = () => {
  const { generateAltText, isLoading, error, clearError } = useApi()
  
  const {
    selectedImage,
    preview,
    altText,
    handleImageSelect,
    handleImageRemove,
    setGeneratedAltText
  } = useImageUpload()
  
  const {
    voiceSettings,
    updateVoiceSetting
  } = useVoiceSettings()
  
  const {
    isPlaying,
    isPaused,
    isLoading: voiceLoading,
    error: voiceError,
    speak,
    pause,
    stop,
    availableVoices: openaiVoices,
    loadVoices,
    clearError: clearVoiceError
  } = useOpenAITTS()

  

  useEffect(() => {
    loadVoices()
  }, [loadVoices])

  useEffect(() => {
    if (openaiVoices.length > 0 && !voiceSettings.voice) {
      const alloyVoice = openaiVoices.find(voice => voice.id === 'alloy')
      const defaultVoice = alloyVoice || openaiVoices[0]
      updateVoiceSetting('voice', defaultVoice.id)
    }
  }, [openaiVoices, voiceSettings.voice, updateVoiceSetting])

  const handleVoiceChange = useCallback((voiceName: string) => {
    updateVoiceSetting('voice', voiceName)
  }, [updateVoiceSetting])

  const handlePlay = useCallback(async () => {
    await speak(altText, voiceSettings)
  }, [speak, altText, voiceSettings])

  const handleClear = useCallback(() => {
    handleImageRemove()
    stop()
  }, [handleImageRemove, stop])

  const compressImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const maxSize = 1024
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx?.drawImage(img, 0, 0, width, height)
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(compressedDataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const handleGenerateAltText = useCallback(async () => {
    if (!selectedImage) return

    setGeneratedAltText('')
    
    try {
      const compressedBase64 = await compressImage(selectedImage)

      const result = await generateAltText({
        image: compressedBase64,
        options: {
          includeObjects: true,
          includeColors: true,
          includeText: true,
          maxLength: 500
        }
      })

      if (result.success) {
        setGeneratedAltText(result.altText)
      }
    } catch (err) {
      console.error('Alt text generation error:', err)
    }
  }, [selectedImage, setGeneratedAltText, generateAltText, compressImage])

  return (
    <div>
      <PageHeader
        title="AltRead"
        description="Generate accessible alt text with voice synthesis"
      />

      <ImageUpload
        onImageSelect={handleImageSelect}
        selectedImage={selectedImage}
        preview={preview}
      />

      <div className="block animate-[fadeIn_0.2s_ease]">
        <div className="mb-4 md:mb-6 overflow-visible">
          <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Output</div>
          <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2 md:gap-6 md:mb-6">
            <ImagePreview
              selectedImage={selectedImage}
              preview={preview}
            />
            <AltTextDisplay
              altText={altText}
              isLoading={isLoading}
            />
          </div>
          
          <GenerateButton
            selectedImage={selectedImage}
            altText={altText}
            isLoading={isLoading}
            onGenerate={handleGenerateAltText}
            onClear={handleClear}
          />
        </div>

        <VoiceControls
          altText={altText}
          isPlaying={isPlaying}
          isPaused={isPaused}
          isLoading={isLoading || voiceLoading}
          onPlay={handlePlay}
          onPause={pause}
          onStop={stop}
        />

        {openaiVoices.length === 0 ? (
          <div className="flex items-center justify-center min-h-[120px]">
            <LoadingState type="spinner" message="Loading voices..." />
          </div>
        ) : (
          <VoiceSettings
            voiceSettings={voiceSettings}
            openaiVoices={openaiVoices}
            onVoiceChange={handleVoiceChange}
          />
        )}
      </div>

      {error && (
        <Toast
          message={error}
          type="error"
          onClose={clearError}
        />
      )}

      {voiceError && (
        <Toast
          message={voiceError}
          type="error"
          onClose={clearVoiceError}
        />
      )}
    </div>
  )
}