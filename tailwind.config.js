/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      colors: {
        primary: '#7c0e6e',
      },
      fontFamily: {
        title: ['Roboto', 'sans-serif'],
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
