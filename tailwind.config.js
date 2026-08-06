/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF4ED",
          100: "#FFE3D0",
          500: "#F26A21",
          600: "#D85314",
          700: "#A83D0C",
        },
        ink: {
          DEFAULT: "#14110F",
          muted: "#6B6560",
          faint: "#A19B95",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#F7F5F2",
        },
        line: "#E7E2DC",
      },
    },
  },
  plugins: [],
};
