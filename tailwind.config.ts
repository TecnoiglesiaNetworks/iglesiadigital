import type { Config } from "tailwindcss";

/** Colores apuntan a variables CSS en globals.css (bloque BRAND TOKENS). */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1160px" } },
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        panel3: "var(--panel3)",
        line: "var(--line)",
        line2: "var(--line2)",
        brand: "var(--brand)",
        brand2: "var(--brand2)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        ink: "var(--text)",
        muted: "var(--muted)",
        good: "var(--good)",
      },
      fontFamily: {
        display: ["var(--font-d)"],
        sans: ["var(--font-b)"],
      },
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        float1: { "0%,100%": { transform: "translate(-60%,0)" }, "50%": { transform: "translate(-52%,34px)" } },
        float2: { "0%,100%": { transform: "translate(0,0)" }, "50%": { transform: "translate(-30px,40px)" } },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
        float1: "float1 16s ease-in-out infinite",
        float2: "float2 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
