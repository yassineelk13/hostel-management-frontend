/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ Palette de couleurs
      colors: {
        primary: {
          DEFAULT: '#C97947',
          light: '#E09770',
          dark: '#A85C35',
          50: '#FDF7F3',
          100: '#F9EBE1',
          200: '#F3D7C3',
          300: '#E9B99A',
          400: '#DC9571',
          500: '#C97947',
          600: '#B06338',
          700: '#8F4D2D',
          800: '#704027',
          900: '#5A3622',
        },
        accent: {
          DEFAULT: '#E8DCC8',
          light: '#F5EFE5',
          dark: '#D4C4AC',
        },
        dark: {
          DEFAULT: '#3D2817',
          light: '#5C3F29',
          lighter: '#7A5539',
        },
        background: '#FAF8F4',
      },

      // ✅ Typographie
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },

      // ✅ Gradients
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #C97947 0%, #E09770 100%)',
        'gradient-sand': 'linear-gradient(180deg, #FAF8F4 0%, #E8DCC8 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },

      // ✅ Ombres
      boxShadow: {
        'soft': '0 4px 20px rgba(201, 121, 71, 0.1)',
        'medium': '0 8px 30px rgba(201, 121, 71, 0.15)',
        'large': '0 20px 60px rgba(201, 121, 71, 0.2)',
        'xl': '0 25px 70px rgba(201, 121, 71, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(61, 40, 23, 0.06)',
      },

      // ✅ NOUVEAU : Animations personnalisées
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-down': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'slide-up': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'slide-in-left': {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
        'slide-in-right': {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
        'scale-in': {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' 
          },
          '50%': { 
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' 
          },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'blob': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },

      // ✅ NOUVEAU : Classes d'animation
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'slide-down': 'slide-down 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-gentle': 'bounce-gentle 1s infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },

      // ✅ NOUVEAU : Delays d'animation
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1s',
        '2000': '2s',
        '4000': '4s',
      },

      // ✅ NOUVEAU : Transitions personnalisées
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ✅ NOUVEAU : Espacements supplémentaires
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ✅ NOUVEAU : Border radius personnalisés
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ✅ NOUVEAU : Z-index pour une meilleure organisation
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ✅ NOUVEAU : Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // ✅ NOUVEAU : Max width personnalisés
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    // ✅ Plugin pour les animation delays
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('animationDelay'),
        }
      );
    },
  ],
}
