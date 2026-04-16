import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        meme: {
          bg:       '#0d0d1a',   // dark navy
          surface:  '#12122a',
          card:     '#1a1a35',
          border:   '#2a2a55',
        },
        neon: {
          green:  '#00ff88',
          pink:   '#ff2d78',
          yellow: '#ffe600',
          cyan:   '#00d4ff',
          purple: '#9945ff',
          orange: '#ff6b00',
        },
      },
      fontFamily: {
        meme:  ['Bangers', 'Impact', 'sans-serif'],   // heading — big & bold
        body:  ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        meme: '0.05em',
      },
      animation: {
        'rainbow':     'rainbow 4s linear infinite',
        'wiggle':      'wiggle 0.5s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'neon-pulse':  'neon-pulse 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s ease-out',
        'live-blink':  'live-blink 1s ease-in-out infinite',
        'glitch':      'glitch 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        rainbow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%':     { transform: 'rotate(3deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'neon-pulse': {
          '0%,100%': { opacity: '1',   textShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          '50%':     { opacity: '0.7', textShadow: '0 0 5px currentColor' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'live-blink': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.2' },
        },
        glitch: {
          '0%,90%,100%': { transform: 'translate(0)' },
          '92%':          { transform: 'translate(-3px, 1px)' },
          '94%':          { transform: 'translate(3px, -1px)' },
          '96%':          { transform: 'translate(-1px, 2px)' },
        },
      },
      boxShadow: {
        'neon-green':  '0 0 12px #00ff88, 0 0 30px rgba(0,255,136,0.3)',
        'neon-pink':   '0 0 12px #ff2d78, 0 0 30px rgba(255,45,120,0.3)',
        'neon-yellow': '0 0 12px #ffe600, 0 0 30px rgba(255,230,0,0.3)',
        'neon-cyan':   '0 0 12px #00d4ff, 0 0 30px rgba(0,212,255,0.3)',
        'neon-purple': '0 0 12px #9945ff, 0 0 30px rgba(153,69,255,0.3)',
        'card':        '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config
