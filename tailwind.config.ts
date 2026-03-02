import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sea: "#0ea5a6",
        coral: "#f97316",
        sand: "#fff5e6",
        mist: "#e2f7f6"
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(15, 23, 42, 0.45)",
        glow: "0 0 0 6px rgba(14, 165, 166, 0.15)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
