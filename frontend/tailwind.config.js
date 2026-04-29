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
        bg:      "var(--c-bg)",
        surface: "var(--c-surface)",
        surface2:"var(--c-surf2)",
        surface3:"var(--c-surf3)",
        bdr:     "var(--c-bdr)",
        bdr2:    "var(--c-bdr2)",
        accent:  "#4F6EF7",
        accent2: "#3A56E8",
        textpri: "var(--c-textpri)",
        textsec: "var(--c-textsec)",
        texttri: "var(--c-texttri)",
      },
    },
  },
  plugins: [],
};
