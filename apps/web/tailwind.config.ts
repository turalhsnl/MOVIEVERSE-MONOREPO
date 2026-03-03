import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg:"#070A13", surface:"rgba(255,255,255,0.06)", border:"rgba(255,255,255,0.10)", text:"rgba(255,255,255,0.92)", muted:"rgba(255,255,255,0.65)", brandA:"#6D5BFF", brandB:"#28D7FF" } } },
  plugins: [],
} satisfies Config;
