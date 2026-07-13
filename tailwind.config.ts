import type { Config } from "tailwindcss";

// Paleta "forno artesanal": carvão + brasa âmbar + trigo.
// Evita o azul-SaaS genérico e o vermelho-tomate/verde-manjericão clichê de pizzaria.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carvao: {
          950: "#15130F", // fundo principal — carvão de forno a lenha
          900: "#1D1A15",
          800: "#28241D",
          700: "#3A342A",
        },
        brasa: {
          400: "#E8935A", // âmbar-brasa — cor de marca, não é vermelho-tomate
          500: "#D97840",
          600: "#B85E2C",
        },
        trigo: {
          50: "#FBF7EF", // farinha/trigo — neutro quente para texto sobre fundo escuro
          200: "#EAE0CC",
          400: "#B9AC8E",
        },
        sinal: {
          verde: "#5A8F6B",
          amarelo: "#D4A94E",
          vermelho: "#C1553D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
