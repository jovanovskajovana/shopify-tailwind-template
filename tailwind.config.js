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
        //example:
        white: {
          100: '#fff',
        },
        black: {
          100: '#000',
        },
        blue: {
          100: '#374295',
        },
      },
      fontFamily: {
        // Add your custom fonts here
        //example:
        'helvetica-now': ['Helvetica Now Display', 'sans-serif'],
        'pp-formula': ['PPFormula', 'monospace'],
        'pp-formula-condensed': ['PPFormula Condensed', 'monospace'],
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
        //example:
        gallery: 'cubic-bezier(0, 0, 0.06, 1)',
      },
      keyframes: {
        //example:
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        //example:
        marquee: 'marquee 60s linear infinite',
      },
    },
  },
  plugins: [
    //example:
    function ({ addVariant }) {
      addVariant('is-active', '&.is-active')
    },
  ],
}
