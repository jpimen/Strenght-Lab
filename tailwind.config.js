/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iron: {
          900: '#111111',
          800: '#222222',
          700: '#333333',
          red: '#dc2626', // Standard crisp red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}

