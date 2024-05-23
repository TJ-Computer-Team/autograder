// tailwind.config.js
module.exports = {
  content: [
    './views/**/*.ejs',
    './src/**/*.{js,jsx,ts,tsx}', // Adjust paths as needed
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1a202c', // Custom dark background color
        outlineRed: '#ff0000', // Custom red outline color
        customRed: '#ff0000', // Custom red text color
      },
    },
  },
  plugins: [],
};
