import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // "Primary": "#38B000",
        // green: {
        //   800: "#38B000",
        // },
        Primary: {
          DEFAULT: "#096FB1", // Azul principal
          light: "#07A5DF", // Azul claro
          lighter: "#1FB5DA",
          extraLight: "#93c5fd", // Azul muy claro para fondos
          dark: "#075E99",
          darker: "#054A7A",
        },
        Neutral: {
          light: "#F0F4F8",
          DEFAULT: "#D9E2EC",
          dark: "#102A43",
        },
        Complementary: "#FFB700", // Amarillo/dorado
        Accent: {
          1: "#FFD700", // Amarillo brillante
          2: "#FF5733", // Naranja fuerte
          3: "#33CFFF", // Azul claro complementario
        },
        Error: {
          DEFAULT: "#FF4D4F",
          dark: "#D9363E",
        },
        Warning: {
          DEFAULT: "#FAAD14",
          dark: "#D48806",
        },
        Success: {
          DEFAULT: "#52C41A",
          dark: "#389E0D",
        },
        Info: {
          DEFAULT: "#1890FF",
          dark: "#096DD9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-pulse": "border-pulse 1.5s infinite",
      },
      center: {
        justifyContent: "center",
        alignItems: "center",
      },
      spacing: {
        "72px": "72px",
        "264px": "264px",
      },
    },
  },
  //   plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
