/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E8F1F9',
          DEFAULT: '#1E3A8A',
          dark: '#0F1D47'
        },
        accent: {
          light: '#93C5FD',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};