/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        bg: "#0A0B0E",
        surface: "#111318",
        surface2: "#1A1D26",
        surface3: "#222631",
        bdr: "#2A2E3E",
        bdr2: "#363C52",
        accent: "#4F6EF7",
        accent2: "#3A56E8",
        textpri: "#F0F2F8",
        textsec: "#9BA3C2",
        texttri: "#5C6480",
      },
    },
  },
  plugins: [],
};
