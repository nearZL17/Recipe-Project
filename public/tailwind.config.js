/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
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

