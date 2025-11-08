import { useState, useCallback, useRef } from 'react'
import { VoiceSettings, OpenAIVoice } from '../types'
import { API_BASE_URL_NO_PATH } from '../utils/api'

interface UseOpenAITTSReturn {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  error: string | null
  availableVoices: OpenAIVoice[]
  speak: (text: string, settings: VoiceSettings) => Promise<void>
  pause: () => void
  stop: () => void
  loadVoices: () => Promise<void>
  clearError: () => void
}

export const useOpenAITTS = (): UseOpenAITTSReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableVoices, setAvailableVoices] = useState<OpenAIVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const loadVoices = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL_NO_PATH}/api/v1/voice/openai/voices`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableVoices(data.voices)
      } else {
        setError(data.error || 'Failed to load voices')
      }
    } catch (err) {
      setError('Failed to load OpenAI voices')
      console.error('Error loading OpenAI voices:', err)
    }
  }, [])

  const speak = useCallback(async (text: string, settings: VoiceSettings) => {
    if (!text || text.trim().length === 0) {
      setError('No text provided for speech')
      return
    }

    if (isPaused && audioRef.current) {
      try {
        await audioRef.current.play()
        return
      } catch (err) {
        console.warn('Failed to resume audio:', err)
      }
    }

    setIsLoading(true)
    setError(null)
    setIsPaused(false)

    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const response = await fetch(`${API_BASE_URL_NO_PATH}/api/v1/voice/openai/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: settings.voice,
          model: settings.model || 'tts-1',
          speed: 1.0, // Default speed
          response_format: 'mp3'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onloadstart = () => {
        setIsLoading(false)
        setIsPlaying(true)
        setIsPaused(false)
      }

      audio.onpause = () => {
        setIsPlaying(false)
        setIsPaused(true)
      }

      audio.onplay = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }

      audio.onended = () => {
        setIsPlaying(false)
        setIsPaused(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      audio.onerror = (e) => {
        setIsPlaying(false)
        setIsPaused(false)
        setIsLoading(false)
        setError('Failed to play audio')
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
        console.error('Audio playback error:', e)
      }

      await audio.play()

    } catch (err) {
      setIsLoading(false)
      setIsPlaying(false)
      setIsPaused(false)
      setError(err instanceof Error ? err.message : 'Failed to generate speech')
      console.error('OpenAI TTS error:', err)
    }
  }, [isPaused])

  const pause = useCallback(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPaused])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setIsPaused(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isPlaying,
    isPaused,
    isLoading,
    error,
    availableVoices,
    speak,
    pause,
    stop,
    loadVoices,
    clearError
  }
}
