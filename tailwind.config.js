// tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Adjust paths as necessary
  theme: {
    extend: {
      colors: {
        mcRed: {
          light: '#FF6F61',
          DEFAULT: '#D88C8C',
          dark: '#A51E15',
        },
        mcYellow: {
          light: '#FFE082',
          DEFAULT: '#F6E27F',
          dark: '#E0A800',
        },
        mcBlack: {
          DEFAULT: '#2D2926',
        },
        mcCreme: {
          DEFAULT: '#EADDCA',
          off: '#FAF9F6'
        },
        mcGray: {
          light: '#6e6e6e',
          DEFAULT: '4b4b4b',
          dark: '#616161',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
