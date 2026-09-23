import type { Config } from "tailwindcss";

// Tokens come from the RIL press kit. `coral` is not an official palette colour —
// approximated from the kit's red "don't" markers. Used for errors and, in the
// narrative layer, for the rival/adversary (see the README design-system note).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: "#212120",
        "ink-2": "#2B2B2A",
        paper: "#FFFFFF",
        blue: "#177AE5",
        sky: "#2EA3E5",
        teal: "#29BDCC",
        green: "#29CC6E",
        coral: "#FF5A5F",
        fog: { 100: "#E3E4E5", 200: "#C7C9CC", 300: "#ABAFB2", 400: "#8F9499", 500: "#73797F" },
      },
      fontFamily: {
        sans: ['"Open Sans Variable"', "Open Sans", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderWidth: { 3: "3px" },
      boxShadow: {
        hard: "6px 6px 0 0 #177AE5",
        "hard-white": "6px 6px 0 0 #FFFFFF",
        "hard-green": "6px 6px 0 0 #29CC6E",
        "hard-coral": "6px 6px 0 0 #FF5A5F",
        "hard-sm": "3px 3px 0 0 #177AE5",
      },
      letterSpacing: { label: "0.24em" },
      borderRadius: { none: "0" },
    },
  },
  plugins: [],
};
export default config;
