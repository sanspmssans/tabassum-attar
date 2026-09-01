import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        luxury: {
          dark: "#0F1014",
          black: "#08080A",
          charcoal: "#1A1C23",
          card: "#14161D",
          border: "#2A2D3A",
          cream: "#FAF8F5",
          sand: "#F0EBE1",
        },
        gold: {
          50: "#FCF9EE",
          100: "#F7F0D4",
          200: "#EFE0A6",
          300: "#E4CA73",
          400: "#D9B444",
          500: "#C69E2A",
          600: "#A8801F",
          700: "#86601B",
          800: "#6B4B1B",
          900: "#593E1A",
        },
        primary: {
          DEFAULT: "#C69E2A",
          foreground: "#08080A",
        },
        secondary: {
          DEFAULT: "#1A1C23",
          foreground: "#FAF8F5",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#232631",
          foreground: "#949CB0",
        },
        accent: {
          DEFAULT: "#D9B444",
          foreground: "#08080A",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        arabic: ["Amiri", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(135deg, #14161D 0%, #08080A 100%)",
        "gold-gradient": "linear-gradient(135deg, #E4CA73 0%, #C69E2A 50%, #86601B 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;