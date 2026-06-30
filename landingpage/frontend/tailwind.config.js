/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "blue-brand": "#5BC0EB",
        "yellow-brand": "#FFD93D",
        "pink-brand": "#FF8FAB",
        "green-brand": "#6EE7B7",
        dark: "#2B2B2B",
      },
      fontFamily: {
        heading: ["'Fredoka', sans-serif"],
        body: ["'Nunito', sans-serif"],
      },
      borderRadius: {
        blob: "3rem",
        card: "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

