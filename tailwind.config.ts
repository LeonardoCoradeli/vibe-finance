import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        finance: {
          dark: "#0b0f17",
          card: "#111827",
          cardBorder: "#1f2937",
          accent: "#10b981",
          income: "#10b981",
          expense: "#ef4444",
          vr: "#f59e0b",
          free: "#3b82f6",
          reserve: "#8b5cf6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
