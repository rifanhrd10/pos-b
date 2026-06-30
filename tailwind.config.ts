import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bayaro: {
          navy: "#0A1F54",
          blue: "#135FEF",
          aqua: "#22D3EE",
          slate: "#1E293B",
          soft: "#F5F8FF",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 31, 84, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
