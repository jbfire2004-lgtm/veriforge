/** @type {import('tailwindcss').Config} */
/**
 * VERA design system — mirrors `app/globals.css` `@theme inline` for tooling
 * and any legacy consumers. Tailwind v4 primary source of truth is CSS `@theme`.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vera: {
          /** Deep navy — primary brand */
          deep: "#0A1A2F",
          /** Hover / pressed on deep surfaces */
          blue: "#132A42",
          /** Electric teal — accent & CTAs */
          teal: "#00E0C6",
          /** Body text & chrome */
          charcoal: "#1F2933",
          /** Secondary text, borders, icons */
          slate: "#3A4750",
          white: "#FFFFFF",
          surface: "#EEF2F6",
          muted: "#6B7780",
          /** Legacy alias used in older routes */
          dark: "#0A1A2F",
        },
      },
      spacing: {
        "vera-1": "4px",
        "vera-2": "6px",
        "vera-3": "8px",
        "vera-4": "12px",
        "vera-5": "16px",
        "vera-6": "24px",
        "vera-8": "32px",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        md: "0 4px 6px -1px rgb(10 26 47 / 0.08), 0 2px 4px -2px rgb(10 26 47 / 0.06)",
        vera: "0 4px 14px rgba(10, 26, 47, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-inter-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontWeight: {
        /** Headings use medium in the VERA spec */
        heading: "500",
      },
    },
  },
  plugins: [],
};
