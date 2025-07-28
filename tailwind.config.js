/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}', // Scans Angular templates and TypeScript files
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          250: '#DCDCDC', // Custom neutral-250 color (~midpoint between neutral-200 and neutral-300)
        },
      },
    },
  },
  plugins: [],
};
