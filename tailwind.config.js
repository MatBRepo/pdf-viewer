/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#4f46e5" },
      },
      borderRadius: { xl: "1rem", "2xl":"1.25rem" },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.08)" }
    },
  },
  plugins: [],
};
