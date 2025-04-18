/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FEC430',
        'dark-bg': '#1E1E1E',
        'light-grey-bg': 'rgba(217, 217, 217, 0.02)',
        'white-text': '#FFFFFF',
        'red': '#FF5252',
        'dark-red': '#B20503',
        'green': '#00FF09',
        'grey': '#777777',
        'muted-grey': '#C7C7C7',
        'deep-grey': '#464646',
        'dark-grey': '#303030',
      },
    },
  },
  plugins: [],
}