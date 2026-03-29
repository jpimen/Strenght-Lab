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
      },
      fontSize: {
        xs: '0.825rem',    // 12px * 1.1 = 13.2px
        sm: '0.9625rem',   // 14px * 1.1 = 15.4px
        base: '1.1rem',    // 16px * 1.1 = 17.6px
        lg: '1.238rem',    // 18px * 1.1 = 19.8px
        xl: '1.375rem',    // 20px * 1.1 = 22px
        '2xl': '1.65rem',  // 24px * 1.1 = 26.4px
        '3xl': '2.063rem', // 30px * 1.1 = 33px
        '4xl': '2.475rem', // 36px * 1.1 = 39.6px
        '5xl': '3.3rem',   // 48px * 1.1 = 52.8px
        '6xl': '4.125rem', // 60px * 1.1 = 66px
        '7xl': '4.95rem',  // 72px * 1.1 = 79.2px
        '8xl': '6.6rem',   // 96px * 1.1 = 105.6px
        '9xl': '8.8rem',   // 128px * 1.1 = 140.8px
      }
    },
  },
  plugins: [],
}

