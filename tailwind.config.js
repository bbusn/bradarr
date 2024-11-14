/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/*',
    './src/views/**/*',
    './public/js/*',
  ],
  theme: {
    extend: {
      'colors': {
        'primary': '#F19E39',
      },
    },
  },
  plugins: [],
}

