/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(17, 25, 40, 0.65)',
        darkBorder: 'rgba(255, 255, 255, 0.06)',
        brandIndigo: '#6366f1',
        brandCyan: '#06b6d4',
        brandPurple: '#a855f7',
        scoreGreen: '#10b981',
        scoreYellow: '#f59e0b',
        scoreRed: '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
      }
    },
  },
  plugins: [],
}
