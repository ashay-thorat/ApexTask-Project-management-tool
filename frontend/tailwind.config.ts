import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark-first minimal base colors (Linear inspired)
        "surface-base": "#0A0A0B",
        surface: "#0A0A0B",
        "surface-dim": "#111113",
        "surface-bright": "#1C1C1F",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#0F0F11",
        "surface-container": "#151518",
        "surface-container-high": "#222225",
        "surface-container-highest": "#2C2C30",
        
        "on-surface": "#EDEDED",
        "on-surface-variant": "#8F8F91",
        
        // Electric Blue Accent
        primary: "#5E6AD2",
        "on-primary": "#FFFFFF",
        "primary-container": "#5E6AD233",
        "on-primary-container": "#B6BEFF",
        
        // State colors
        error: "#F87171",
        "on-error": "#450A0A",
        "error-container": "#7F1D1D",
        "on-error-container": "#FECACA",
        
        secondary: "#34D399",
        "on-secondary": "#022C22",
        "secondary-container": "#065F46",
        tertiary: "#FBBF24",
        "on-tertiary": "#451A03",
        "tertiary-container": "#92400E",
        
        outline: "#3A3A40",
        "outline-variant": "#27272A",
        
        background: "#0A0A0B",
        "on-background": "#EDEDED",
        
        "surface-tint": "#5E6AD2",
        "surface-variant": "#1C1C1F",
        "inverse-surface": "#EDEDED",
        "inverse-on-surface": "#0A0A0B",
        
        // Light mode equivalents (Inverted minimal)
        "light-surface": "#FFFFFF",
        "light-surface-dim": "#F9FAFB",
        "light-surface-bright": "#FFFFFF",
        "light-surface-container": "#F3F4F6",
        "light-surface-container-high": "#E5E7EB",
        "light-surface-container-highest": "#D1D5DB",
        "light-on-surface": "#111827",
        "light-on-surface-variant": "#6B7280",
        "light-primary": "#5E6AD2",
        "light-on-primary": "#FFFFFF",
        "light-primary-container": "#EEF2FF",
        "light-on-primary-container": "#3730A3",
        "light-secondary": "#34D399",
        "light-on-secondary": "#022C22",
        "light-secondary-container": "#D1FAE5",
        "light-background": "#FFFFFF",
        "light-on-background": "#111827",
        "light-outline": "#D1D5DB",
        "light-outline-variant": "#E5E7EB",
        "light-error": "#EF4444",
        "light-on-error": "#FFFFFF",
        "light-error-container": "#FEE2E2",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem", // 8px
        xl: "0.75rem", // 12px
        "2xl": "1rem",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        label: ["Geist", "Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "500" }],
        "mono-sm": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "4rem",
        gutter: "1.5rem",
      },
      transitionTimingFunction: {
        'fast': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
} satisfies Config;
