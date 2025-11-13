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
    <div className="mb-4 md:mb-6 overflow-visible">
      <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Voice Settings</div>
      <div className="bg-surface-secondary rounded-sm p-4 overflow-visible">
        <div className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:gap-4">
          <CustomDropdown
            label="Voice"
            options={openaiVoiceOptions}
            value={voiceSettings.voice}
            onChange={onVoiceChange}
            placeholder="Select a voice"
          />

          <div className="flex flex-col overflow-visible">
            <label className="text-sm text-content-secondary mb-1.5 flex justify-between items-center">Model</label>
            <div className="flex items-center justify-between px-2 py-1.5 border border-[var(--border)] rounded-sm bg-surface-secondary text-base text-content-secondary">
              <span className="flex-1 font-medium">Standard (tts-1)</span>
              <span className="bg-content-tertiary text-surface-primary px-1.5 py-0.5 rounded-[2px] text-xs font-medium uppercase tracking-wider">Fixed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
