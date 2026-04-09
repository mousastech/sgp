/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        engie: {
          blue: "#003DA5",
          "blue-dark": "#002D7A",
          "blue-light": "#00AAFF",
          green: "#A0CE4E",
          "green-dark": "#8BBE3A",
          dark: "#1D1D1B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
