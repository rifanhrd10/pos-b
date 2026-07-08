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
        "on-primary-fixed-variant": "#1f477b",
        "surface-container-high": "#e6e8ea",
        "surface-variant": "#e0e3e5",
        "on-tertiary-fixed": "#0b1c30",
        "error-container": "#ffdad6",
        "inverse-surface": "#2d3133",
        "on-secondary-container": "#003558",
        "on-tertiary-container": "#8c9cb5",
        "tertiary-fixed-dim": "#b7c8e1",
        "tertiary": "#0e1f32",
        "primary-container": "#003366",
        "on-primary-fixed": "#001b3c",
        "on-surface": "#191c1e",
        "primary-fixed-dim": "#a7c8ff",
        "inverse-on-surface": "#eff1f3",
        "surface-container-low": "#f2f4f6",
        "surface-tint": "#3a5f94",
        "background": "#f7f9fb",
        "primary-fixed": "#d5e3ff",
        "surface-container-highest": "#e0e3e5",
        "secondary-container": "#00a2fd",
        "error": "#ba1a1a",
        "outline": "#737780",
        "on-primary": "#ffffff",
        "secondary-fixed": "#cfe5ff",
        "secondary": "#00629d",
        "on-secondary-fixed-variant": "#004a77",
        "tertiary-container": "#243448",
        "tertiary-fixed": "#d3e4fe",
        "surface-container": "#eceef0",
        "on-secondary": "#ffffff",
        "surface-dim": "#d8dadc",
        "on-surface-variant": "#43474f",
        "on-error-container": "#93000a",
        "secondary-fixed-dim": "#98cbff",
        "on-background": "#191c1e",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "outline-variant": "#c3c6d1",
        "surface-bright": "#f7f9fb",
        "on-tertiary-fixed-variant": "#38485d",
        "on-primary-container": "#799dd6",
        "inverse-primary": "#a7c8ff",
        "surface": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "on-secondary-fixed": "#001d33",
        "primary": "#001e40"
      },
      borderRadius: {
        "4xl": "2rem",
      },
      spacing: {
        "base": "8px",
        "section-margin": "40px",
        "gutter": "20px",
        "card-gap": "24px",
        "container-padding": "24px"
      },
      fontFamily: {
        "label-md": ["Inter"],
        "body-md": ["Inter"],
        "headline-md": ["Plus Jakarta Sans"],
        "title-lg": ["Inter"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "display-lg": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "body-lg": ["Inter"]
      },
      fontSize: {
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "title-lg": ["18px", {"lineHeight": "28px", "fontWeight": "600"}],
        "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "600"}],
        "display-lg": ["48px", {"lineHeight": "60px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 31, 84, 0.08)",
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
