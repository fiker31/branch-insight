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
        bg:      "rgb(var(--c-bg)      / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        surface2:"rgb(var(--c-surf2)   / <alpha-value>)",
        surface3:"rgb(var(--c-surf3)   / <alpha-value>)",
        bdr:     "rgb(var(--c-bdr)     / <alpha-value>)",
        bdr2:    "rgb(var(--c-bdr2)    / <alpha-value>)",
        accent:  "rgb(79 110 247       / <alpha-value>)",
        accent2: "rgb(58 86 232        / <alpha-value>)",
        textpri: "rgb(var(--c-textpri) / <alpha-value>)",
        textsec: "rgb(var(--c-textsec) / <alpha-value>)",
        texttri: "rgb(var(--c-texttri) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
