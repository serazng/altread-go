export interface VoiceSettings {
  voice: string
  rate: number
  pitch: number
  volume: number
  provider: 'openai'
  model: 'tts-1' | 'tts-1-hd'
}

export interface OpenAIVoice {
  id: string
  name: string
  description: string
}

export interface ImageUpload {
  id: string
  file: File
  preview: string
  altText?: string
  createdAt: Date
}

export interface GenerateAltTextRequest {
  image: string
  options: {
    includeObjects: boolean
    includeColors: boolean
    includeText: boolean
    maxLength: number
  }
}

export interface GenerateAltTextResponse {
  success: boolean
  altText: string
  error?: string
}

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}
