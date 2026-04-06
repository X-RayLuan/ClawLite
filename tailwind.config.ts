import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* usememos stone palette */
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09"
        },
        ink: "#1c1917",
        accent: "#ea580c"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 90px -58px rgba(68,50,33,0.4)",
        elevated: "0 24px 90px -58px rgba(68,50,33,0.55)"
      },
      borderRadius: {
        xl: "12px",
        "2xl": "2.2rem",
        "3xl": "2.2rem"
      },
      maxWidth: {
        layout: "var(--fd-layout-width)"
      }
    }
  },
  plugins: []
};

export default config;
