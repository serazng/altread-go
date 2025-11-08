import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Settings } from 'lucide-react';
import { VoiceSettings } from '@altread/types';

interface VoiceControlsProps {
  text: string;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  text,
  settings,
  onSettingsChange,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
      setVoices(window.speechSynthesis.getVoices());
      
      // Load voices when they become available
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = () => {
    if (!synth || !text) return;

    // Stop any current speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    if (settings.voice && voices.length > 0) {
      const selectedVoice = voices.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const pause = () => {
    if (synth) {
      if (isPaused) {
        synth.resume();
      } else {
        synth.pause();
      }
    }
  };

  const stop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleSettingChange = (key: keyof VoiceSettings, value: number | string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={isPlaying ? stop : speak}
          disabled={!text}
          className="p-2 bg-[#2383e2] text-white rounded-lg hover:bg-[#1a6bb8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        {isPlaying && (
          <button
            onClick={pause}
            className="p-2 bg-[#e9e9e7] text-[#37352f] rounded-lg hover:bg-[#d4d4d2] transition-colors"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-[#e9e9e7] text-[#37352f] rounded-lg hover:bg-[#d4d4d2] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#f7f7f5] rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-[#37352f] mb-3">Voice Settings</h4>
          
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-[#37352f] mb-2">
              Voice
            </label>
            <select
              value={settings.voice}
              onChange={(e) => handleSettingChange('voice', e.target.value)}
              className="w-full p-2 border border-[#e9e9e7] rounded-lg bg-white focus:ring-2 focus:ring-[#2383e2] focus:border-transparent"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-[#37352f] mb-2">
              Speed: {settings.rate}x
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium text-[#37352f] mb-2">
              Pitch: {settings.pitch}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-[#37352f] mb-2">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;
