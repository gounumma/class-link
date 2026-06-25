import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#0a1733", 900: "#102044", 800: "#173366" },
        skysoft: "#eef6ff",
        coral: "#f47960"
      },
      boxShadow: {
        card: "0 12px 40px rgba(16, 32, 68, 0.08)",
        soft: "0 8px 24px rgba(16, 32, 68, 0.06)"
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" }
    }
  },
  plugins: [typography]
};

export default config;
