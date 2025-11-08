import { useState, useEffect, useCallback } from 'react'
import { VoiceSettings } from '../types'

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: 'alloy',
  rate: 1,
  pitch: 1,
  volume: 1,
  provider: 'openai',
  model: 'tts-1',
}

export const useVoiceSettings = () => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      
      const cleanVoices = allVoices.filter(voice => {
        const name = voice.name.toLowerCase()
        const lang = voice.lang.toLowerCase()
        
        if (!lang.startsWith('en')) return false
        
        const excludePatterns = [
          'robot', 'synthetic', 'neural', 'wave', 'sam', 'alex', 'cortana',
          'siri', 'alexa', 'google', 'amazon', 'polly', 'neural', 'wave',
          'desktop', 'mobile', 'compact', 'enhanced', 'premium'
        ]
        
        if (excludePatterns.some(pattern => name.includes(pattern))) return false
        
        const preferPatterns = [
          'david', 'zira', 'mark', 'susan', 'karen', 'daniel', 'samantha',
          'alex', 'victoria', 'thomas', 'hazel', 'fiona', 'moira', 'tessa',
          'veena', 'nicole', 'aaron', 'fred', 'ralph', 'bella', 'jill'
        ]
        
        return preferPatterns.some(pattern => name.includes(pattern))
      })
      
      const selectedVoices = cleanVoices.slice(0, 5)
      
      setAvailableVoices(selectedVoices)
  
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [voiceSettings.voice])

  const updateVoiceSetting = useCallback((key: keyof VoiceSettings, value: string | number) => {
    setVoiceSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setVoiceSettings(DEFAULT_VOICE_SETTINGS)
  }, [])

  return {
    voiceSettings,
    availableVoices,
    updateVoiceSetting,
    resetToDefaults
  }
}
