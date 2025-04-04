const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        // Set Lausanne as the default sans-serif font
        sans: ['Lausanne', ...defaultTheme.fontFamily.sans],
        // Add Tartuffo as the serif font
        serif: ['Tartuffo', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
