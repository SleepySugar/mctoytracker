// tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Adjust paths as necessary
  theme: {
    extend: {
      colors: {
        mcRed: {
          light: '#FF6F61',
          DEFAULT: '#DA291C',
          dark: '#A51E15',
        },
        mcYellow: {
          light: '#FFE082',
          DEFAULT: '#FFC72C',
          dark: '#E0A800',
        },
        mcBlack: {
          DEFAULT: '#2D2926',
        },
        mcWhite: {
          DEFAULT: '#FFFFFF',
          off: '#FAF9F6'
        },
        mcGray: {
          light: '#F5F5F5',
          DEFAULT: '#9E9E9E',
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
