import type { Config } from "tailwindcss";

/**
 * DROPLY 디자인 시스템 — acid-lime 다크 미니멀.
 * 시안의 Material 토큰을 그대로 포팅하여 디자인 일관성을 보장한다.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "acid-lime": "#D4FF3F",
        background: "#131313",
        surface: "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "surface-variant": "#353534",
        primary: "#ffffff",
        "on-background": "#e5e2e1",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c5c9ae",
        secondary: "#c6c6c7",
        "secondary-container": "#454747",
        "on-secondary-container": "#b4b5b5",
        outline: "#8f937a",
        "outline-variant": "#444934",
        "primary-fixed": "#c8f232",
        "primary-fixed-dim": "#add500",
        "primary-container": "#c8f232",
        "on-primary": "#293500",
        "on-primary-fixed": "#171e00",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        gutter: "12px",
        "container-margin": "20px",
        "section-gap": "48px",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-be-vietnam)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg": ["40px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "headline-sm": ["20px", { lineHeight: "1.3", fontWeight: "700" }],
        "price-tag": ["20px", { lineHeight: "1.0", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "600" }],
      },
      boxShadow: {
        acid: "0 0 20px rgba(212, 255, 63, 0.15)",
        "acid-lg": "0 0 32px rgba(212, 255, 63, 0.25)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.95)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-up": {
          from: { transform: "translateY(60px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        marquee: "marquee 20s linear infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "reveal-up": "reveal-up 1s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
