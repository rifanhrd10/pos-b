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
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-8px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(8px)" },
        },
      },
      animation: {
        shake: "shake 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
