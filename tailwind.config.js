/** @type {import('tailwindcss').Config} */
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
      },
    },
    plugins: [],
  };