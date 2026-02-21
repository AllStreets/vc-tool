export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a',
          800: '#1a1f35',
          700: '#2d3748',
        },
        trend: {
          'ai-ml': '#6366f1',
          'fintech': '#ec4899',
          'climate': '#10b981',
          'healthcare': '#ef4444',
          'cybersecurity': '#8b5cf6',
          'web3-crypto': '#f97316',
          'saas': '#06b6d4',
          'robotics': '#14b8a6',
          'creator': '#d946ef',
          'other': '#f59e0b',
        }
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}
