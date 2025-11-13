/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors (backgrounds)
        'surface-primary': 'var(--bg-primary)',
        'surface-secondary': 'var(--bg-secondary)',
        'surface-hover': 'var(--bg-hover)',
        // Content colors (text)
        'content-primary': 'var(--text-primary)',
        'content-secondary': 'var(--text-secondary)',
        'content-tertiary': 'var(--text-tertiary)',
        // Border colors - use with border-border-default and border-border-dark
        'border-default': 'var(--border)',
        'border-dark': 'var(--border-dark)',
        // Accent colors
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['12px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.5' }],
        'lg': ['16px', { lineHeight: '1.6' }],
        'xl': ['18px', { lineHeight: '1.6' }],
        '2xl': ['20px', { lineHeight: '1.3' }],
        '3xl': ['24px', { lineHeight: '1.3' }],
      },
      spacing: {
        '0.5': '2px',
        '1.5': '6px',
        '3': '12px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '24': '96px',
      },
      borderRadius: {
        'sm': '3px',
        'md': '6px',
        'lg': '8px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
