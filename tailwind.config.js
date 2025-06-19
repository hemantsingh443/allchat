/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: 'class', 
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        boxShadow: {
          'glass': '0px 8px 32px rgba(0, 0, 0, 0.07)',
        },
        fontFamily: {
          sans: ['Geist', ...defaultTheme.fontFamily.sans],
          inter: ['Inter', ...defaultTheme.fontFamily.sans],
          georgia: ['Georgia', 'serif'],
          nunito: ['Nunito', ...defaultTheme.fontFamily.sans],
          comfortaa: ['Comfortaa', 'sans-serif'],
          kalam: ['Kalam', 'cursive'],
          orbitron: ['Orbitron', 'sans-serif'],
          righteous: ['Righteous', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };