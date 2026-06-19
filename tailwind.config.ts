import type { Config } from "tailwindcss";

const config: Config = {
  // NOTE: project uses app/ + components/ at the root (no src/ dir).
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF", // Haupt-Hintergrund
        surface: "#C3EDF2", // Cards / Sektionen
        "surface-dark": "#1B5879", // Header / Footer / dunkle Sektionen
        text: "#1B5879", // Haupttext (AAA auf Weiß)
        "text-accent": "#4C5E42", // Akzenttext, sparsam (AAA auf Weiß)
        primary: "#1B5879", // Primär-Button (Schrift weiß)
        accent: "#4C5E42", // Akzent-Button (Schrift weiß)
        decor: "#6B855D", // NUR dekorativ/Grafik – niemals Text
        border: "#1B5879", // funktionale Rahmen + Fokus-Ring
        divider: "#CAC8CC", // nur dekorative Trennlinien
      },
      fontFamily: {
        // Variablen werden von next/font gesetzt (siehe app/fonts.ts)
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // [Größe, { lineHeight }] – Untergrenzen nie unterschreiten
        h1: ["3rem", { lineHeight: "1.1" }], // 48px
        h2: ["2.25rem", { lineHeight: "1.15" }], // 36px
        h3: ["1.875rem", { lineHeight: "1.2" }], // 30px
        h4: ["1.5rem", { lineHeight: "1.25" }], // 24px
        body: ["1.125rem", { lineHeight: "1.6" }], // 18px (Fließtext)
        small: ["0.875rem", { lineHeight: "1.5" }], // 14px
      },
      // Spacing: Tailwind-Default ist bereits 4-px-basiert -> keine Anpassung nötig.
    },
  },
  plugins: [],
};

export default config;
