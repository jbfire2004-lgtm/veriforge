/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          ink: "#0f1714",
          forest: "#1a3a32",
          moss: "#2d6a4f",
          mint: "#52b788",
          sand: "#e8efe9",
          mist: "#f3f7f4",
          steel: "#4a5568",
          alert: "#b45309",
          danger: "#b91c1c",
        },
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(15,23,20,0.06), 0 12px 32px rgba(15,23,20,0.08)",
      },
    },
  },
  plugins: [],
};
