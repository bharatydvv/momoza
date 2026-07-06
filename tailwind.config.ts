import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0d0d0d",
          soft: "#121212",
          card: "#1a1a1a",
          elevated: "#202020",
        },
        brand: {
          DEFAULT: "#e50914",
          hover: "#ff1a25",
          soft: "#3a0d10",
        },
        line: "#2a2a2a",
        muted: "#9a9a9a",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(229,9,20,0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        expand: {
          "0%": { opacity: "0", maxHeight: "0" },
          "100%": { opacity: "1", maxHeight: "500px" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        expand: "expand 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
