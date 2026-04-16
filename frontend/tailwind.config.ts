import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bolt.new-inspired dark palette
        bolt: {
          bg:       '#0a0a0a',   // pure near-black
          surface:  '#111111',   // card surface
          elevated: '#1a1a1a',   // elevated element
          border:   'rgba(255,255,255,0.08)',
          muted:    'rgba(255,255,255,0.04)',
        },
        // Purple/violet primary (bolt.new accent)
        primary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',   // main purple
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        // Text palette
        ink: {
          primary:   '#ffffff',
          secondary: '#a1a1aa',  // zinc-400
          muted:     '#52525b',  // zinc-600
          faint:     '#27272a',  // zinc-800
        },
        // Status colors
        profit: '#22c55e',   // green
        loss:   '#ef4444',   // red
        warn:   '#f59e0b',   // amber
        info:   '#06b6d4',   // cyan
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        'fade-up':      'fade-up 0.4s ease-out',
        'fade-in':      'fade-in 0.3s ease-out',
        'live-blink':   'live-blink 1.5s ease-in-out infinite',
        'float':        'float 4s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'live-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.3' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        // Bolt.new-style radial glow
        'glow-purple': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.25), transparent)',
        'glow-center': 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139,92,246,0.15), transparent)',
        // Gradient text
        'grad-primary': 'linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #06b6d4 100%)',
        'grad-gold':    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        // Grid pattern
        'grid-faint':  'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(139,92,246,0.25)',
        'glow-md':  '0 0 24px rgba(139,92,246,0.30)',
        'glow-lg':  '0 0 48px rgba(139,92,246,0.20)',
        'card':     '0 1px 0 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config
