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
      },
      // Enhanced animations with smooth easing
      animation: {
        // Entrances (smooth ease-out curves)
        fadeIn: 'fadeIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        slideUp: 'slideUp 350ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        slideDown: 'slideDown 350ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        slideLeft: 'slideLeft 350ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        slideRight: 'slideRight 350ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        scaleIn: 'scaleIn 300ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        // Page transitions
        pageIn: 'pageIn 400ms cubic-bezier(0.13, 0.93, 0.23, 0.96) forwards',
        pageOut: 'pageOut 300ms cubic-bezier(0.32, 0.08, 0.24, 0.58) forwards',
        // Exits (smooth ease-in curves)
        fadeOut: 'fadeOut 200ms cubic-bezier(0.77, 0, 1, 0.175) forwards',
        slideUpOut: 'slideUpOut 300ms cubic-bezier(0.32, 0.08, 0.24, 0.58) forwards',
        scaleOut: 'scaleOut 250ms cubic-bezier(0.32, 0.08, 0.24, 0.58) forwards',
        // Micro-interactions with smooth curves
        pulse: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        shake: 'shake 450ms cubic-bezier(0.36, 0, 0.66, 1)',
        pop: 'pop 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        // Entrance animations - smooth interpolation
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.93)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Page transitions - smooth full-screen entrance
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        pageOut: {
          '0%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
          '100%': { opacity: '0', transform: 'translateY(8px)', filter: 'blur(4px)' },
        },
        // Exit animations - smooth fade out
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUpOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-24px)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.93)' },
        },
        // Micro-interactions - smooth and organic
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '50%': { backgroundPosition: '500px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.75)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

