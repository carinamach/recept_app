/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Ytfärger */
        parchment: {
          50: '#FFF8F2',
          100: '#FFF3E8',
          200: '#F9EBDD',
          300: '#EED9C8',
          400: '#DFC4AE',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        /* Text & neutraler (900 = huvudtext #2D2D2D) */
        ink: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#383838',
          900: '#2D2D2D',
          950: '#171717',
        },
        /* Primary — korall #E07A5F */
        primary: {
          DEFAULT: '#E07A5F',
          hover: '#CB6A52',
          foreground: '#FFFFFF',
          muted: '#ED9D8A',
        },
        /* Secondary — sand #F2CC8F */
        secondary: {
          DEFAULT: '#F2CC8F',
          foreground: '#2D2D2D',
          muted: '#FAEAD0',
        },
        /* Accent — salvia #81B29A */
        accent: {
          DEFAULT: '#81B29A',
          hover: '#6D9F86',
          foreground: '#FFFFFF',
          subtle: '#CFE6DC',
          dark: '#5A8F75',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgb(45 45 45 / 0.08)',
        'card-hover': '0 12px 40px -8px rgb(45 45 45 / 0.12)',
        float: '0 8px 32px -6px rgb(224 122 95 / 0.28)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
