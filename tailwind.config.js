/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}', // Scans Angular templates and TypeScript files
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          250: '#DCDCDC'
        },
      },
    },
  },
  plugins: [],
};
