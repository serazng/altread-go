import React from 'react'
import { Button } from '../ui'

export interface VoiceControlsProps {
  altText: string
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  altText,
  isPlaying,
  isPaused,
  isLoading,
  onPlay,
  onPause,
  onStop
}) => {
  return (
    <div className="mb-4 md:mb-6 overflow-visible">
      <div className="text-xs font-medium uppercase tracking-wider text-content-tertiary mb-3">Audio Controls</div>
      <div className="flex flex-col gap-2 mb-4 flex-wrap sm:flex-row sm:mb-6">
        <Button 
          variant="primary"
          disabled={!altText || isLoading}
          onClick={onPlay}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          {isPaused ? 'Resume' : 'Play'}
        </Button>
        <Button 
          disabled={!altText || !isPlaying}
          onClick={onPause}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          Pause
        </Button>
        <Button 
          disabled={!altText || (!isPlaying && !isPaused)}
          onClick={onStop}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18"></rect>
          </svg>
          Stop
        </Button>
      </div>
    </div>
  )
}
