export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    timeout: 30000,
  },
  openai: {
    get apiKey() {
      return process.env.OPENAI_API_KEY || '';
    },
    model: 'gpt-4o',
    maxTokens: 300,
  },
  app: {
    name: 'AltRead',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  storage: {
    statsKey: 'altread-stats',
    settingsKey: 'altread-settings',
  },
  ui: {
    colors: {
      primary: '#37352f',
      secondary: '#787774',
      background: '#f7f7f5',
      border: '#e9e9e7',
      accent: '#2383e2',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
} as const;

export type Config = typeof config;
