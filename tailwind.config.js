/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['*.html'],
  theme: {
    extend: {
      colors: {
        darkBackground: '#2d2d2d',
        darkSlate300: '#3a3a3a',
        darkSlate200: '#4a4a4a',
        darkWhite: '#3a3a3a',
        darkText: '#ffffff',
        darkOrange700: '#ff5722',
        darkAmber700: '#ffb300',
        darkBorder: '#ffffff',
      },
      fontFamily: {
        'dancing-script': ['"Dancing Script"', 'cursive'],
      },
    },
  },
  variants: {},
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.optical-sizing-auto': {
          fontOpticalSizing: 'auto',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

