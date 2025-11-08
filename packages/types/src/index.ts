export interface GenerateAltTextRequest {
  image: string;
  options?: {
    maxLength?: number;
    includeObjects?: boolean;
    includeColors?: boolean;
    includeText?: boolean;
  };
}

export interface GenerateAltTextResponse {
  success: boolean;
  altText: string;
  confidence?: number;
  processingTime?: number;
  error?: string;
}

export interface ImageUpload {
  id: string;
  file: any;
  preview: string;
  altText?: string;
  createdAt: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
}

export interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  provider: 'openai';
  model: 'tts-1' | 'tts-1-hd';
}

export interface OpenAIVoice {
  id: string;
  name: string;
  description: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface TTSResponse {
  success: boolean;
  audioData?: ArrayBuffer;
  error?: string;
  code?: string;
}

export interface DashboardStats {
  totalProcessed: number;
  todayCount: number;
  lastProcessed?: Date;
}

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
};

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export interface BaseComponentProps {
  className?: string;
  children?: any;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  actions?: any;
}
