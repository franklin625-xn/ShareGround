import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8f9fa",
          border: "#e2e4e8",
        },
        text: {
          primary: "#1a1a2e",
          secondary: "#6b7280",
          muted: "#9ca3af",
        },
        accent: {
          blue: "#2563eb",
          green: "#059669",
          amber: "#d97706",
          red: "#dc2626",
          purple: "#7c3aed",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "0.9rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
