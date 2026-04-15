import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // TABBY brand colors - dark crypto theme
        tabby: {
          50:  '#fff8f0',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // primary orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        bank: {
          bg:       '#0a0a0f',    // deep dark background
          surface:  '#12121a',    // card background
          elevated: '#1a1a2e',    // elevated card
          border:   '#2a2a3e',    // border color
          muted:    '#3a3a5e',    // muted elements
        },
        sophia: {
          gold:   '#ffd700',   // Sophia's gold
          purple: '#8b5cf6',   // AI purple
          cyan:   '#06b6d4',   // live indicator
          green:  '#22c55e',   // profit green
          red:    '#ef4444',   // loss red
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'typing': 'typing 1s steps(20) infinite',
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #f97316, 0 0 10px #f97316' },
          '50%': { boxShadow: '0 0 20px #f97316, 0 0 40px #f97316' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 70%)',
        'card-gradient': 'linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
} satisfies Config
