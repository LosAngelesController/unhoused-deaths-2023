const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {},
    },
    // screens: {
    //   'phone': {'max': '900px'},
    //   'laptop': {'max': '1024px'},
    //   'desktop': {'max': '1280px'},
    // }
  },
  darkMode: "class",
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
