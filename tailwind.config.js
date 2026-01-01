/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BASE BACKGROUND: Deep Charcoal Black
        background: '#121312',
        
        // PRIMARY ACCENT: Luxury Red
        primary: {
          DEFAULT: '#ad0013',
          hover: '#8a000f', // Darker shade for hover
          glow: 'rgba(173, 0, 19, 0.5)',
        },
        
        // SECONDARY ACCENT: Royal Gold / Bronze
        secondary: {
          DEFAULT: '#a67d43',
          dim: 'rgba(166, 125, 67, 0.25)', // For glassy borders
        },
        
        // TEXT COLORS
        textPrimary: '#ededed',
        textSecondary: 'rgba(237, 237, 237, 0.7)',
        textMuted: 'rgba(237, 237, 237, 0.45)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
