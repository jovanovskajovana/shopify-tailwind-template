/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
    './assets/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      fontFamily: {
        // Add your custom fonts here
      },
      screens: {
        xs: '360px',
        sm: '672px',
        md: '992px',
        lg: '1200px',
        l: '1440px',
        xl: '1700px',
        xxl: '1900px',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0, 0, 0.06, 1)',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('is-active', '&.is-active')
    },
  ],
}
