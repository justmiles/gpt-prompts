/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'olive': {
          50: '#f7f8f5',
          100: '#ebeee6',
          200: '#d5dbc8',
          300: '#b5c099',
          400: '#96a571',
          500: '#708148',
          600: '#5c6a3b',
          700: '#4a5530',
          800: '#3d4529',
          900: '#343b23',
          950: '#1a1e11',
        },
        'dark': {
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#18212F',
          900: '#111827',
        },
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            pre: {
              backgroundColor: theme('colors.dark.800'),
              color: theme('colors.dark.100'),
              padding: theme('spacing.4'),
              marginTop: '0',
              marginBottom: '0',
              borderRadius: theme('borderRadius.lg'),
            },
            code: {
              backgroundColor: theme('colors.dark.700'),
              color: theme('colors.dark.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25em',
              fontWeight: '400',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};