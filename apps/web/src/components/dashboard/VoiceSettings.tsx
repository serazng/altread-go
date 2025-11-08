import React from 'react'
import { CustomDropdown } from '../ui'
import { VoiceSettings, OpenAIVoice } from '../../types'

export interface VoiceSettingsProps {
  voiceSettings: VoiceSettings
  openaiVoices: OpenAIVoice[]
  onVoiceChange: (voice: string) => void
}

export const VoiceSettingsComponent: React.FC<VoiceSettingsProps> = ({
  voiceSettings,
  openaiVoices,
  onVoiceChange
}) => {
  const openaiVoiceOptions = openaiVoices.map(voice => ({
    value: voice.id,
    label: `${voice.name} - ${voice.description}`
  }))

  return (
    <div className="block">
      <div className="block-title">Voice Settings</div>
      <div className="settings-block">
        <div className="settings-grid">
          <CustomDropdown
            label="Voice"
            options={openaiVoiceOptions}
            value={voiceSettings.voice}
            onChange={onVoiceChange}
            placeholder="Select a voice"
          />

          <div className="setting-item">
            <label className="setting-label">Model</label>
            <div className="model-display">
              <span className="model-text">Standard (tts-1)</span>
              <span className="model-badge">Fixed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
