/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...defaultTheme.colors,
        'servian-orange': '#E96D3C',
        'servian-black': '#272C2D',
        'servian-black-dark': '#1B1E1F',
        'servian-white': '#FFFCFC',
        'servian-light-gray': '#FAFAFA',
      },
    },
  },
  plugins: [],
}
