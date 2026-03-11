/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        "primary-dark": "#4a42cc",
        secondary: "#FF6584",
        success: "#43B97F",
        error: "#FF4B4B",
        warning: "#FFB347",
        "background-dark": "#0F1117",
        "background-light": "#f5f5f8",
        "card-dark": "#1A1D2E",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
