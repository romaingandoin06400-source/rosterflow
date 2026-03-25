import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Neue Haas Grotesk"', '"Helvetica Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0a0a0a', card: '#111111', elevated: '#161616', border: '#1e1e1e' },
        brand: { DEFAULT: '#ff3c6e', muted: '#ff3c6e22', dark: '#cc2050' },
        accent: { blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', purple: '#8b5cf6' },
        text: { primary: '#f4f4f5', secondary: '#a1a1aa', muted: '#52525b' },
      },
      borderRadius: { lg: '12px', xl: '16px', '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 24px rgba(255,60,110,0.15)',
        'glow-lg': '0 0 48px rgba(255,60,110,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 8px rgba(255,60,110,0.2)' }, '50%': { boxShadow: '0 0 24px rgba(255,60,110,0.5)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      }
    }
  },
  plugins: [animate]
} satisfies Config
