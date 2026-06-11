import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#7CE07F",
        background: "#07111F",
        surface: "#0F172A",
        "surface-elevated": "#111827",
        "glass-surface": "rgba(255,255,255,0.08)",
        "glass-border": "rgba(255,255,255,0.12)",
        "text-primary": "#E2E8F0",
        "text-secondary": "#94A3B8",
        muted: "#64748B",
        success: "#22C55E",
        info: "#38BDF8",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0,0,0,0.35)",
        card: "0 16px 40px rgba(0,0,0,0.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;
