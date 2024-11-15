/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/*',
    './src/views/**/*',
    './public/js/*',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#F19E39',
      },
      animation: {
        'alert': 'alert 4s forwards',
      },
      keyframes: {
        alert: {
          '0%': { transform: 'translate(0%, -20%)', opacity: 0 },
          '15%': { transform: 'translate(0%, 0%)', opacity: 1 },
          '90%': { transform: 'translate(0%, 0%)', opacity: 1 },
          '100%': { transform: 'translate(0%, -20%)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}

