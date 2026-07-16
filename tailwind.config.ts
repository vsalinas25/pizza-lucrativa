import type { Config } from "tailwindcss";

// Paleta clara inspirada em fintechs (Payard, Plutus, Stripe): off-white +
// verde pastel de marca + azul índigo como detalhe secundário.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creme: {
          50: "#FAF9F5", // fundo principal — off-white quente, não branco puro
          100: "#F1EEE5", // seções alternadas
          200: "#E4E0D2", // bordas
        },
        menta: {
          50: "#EAF7EF",
          100: "#D2EEE0",
          400: "#5FBE8D", // verde pastel — destaques de texto
          500: "#3FA871", // cor de marca — CTAs
          600: "#2F8B5C", // hover
        },
        indigo: {
          400: "#7C8FEF",
          500: "#5A70E8", // azul — detalhe secundário, usado com moderação
          600: "#4557C9",
        },
        tinta: {
          950: "#181A17", // headings, texto principal
          700: "#4A4D45", // corpo
          400: "#8B8D82", // texto secundário/muted
        },
        sinal: {
          verde: "#3FA871",
          amarelo: "#C99A2E",
          vermelho: "#C6553C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
      },
    },
  },
  plugins: [],
};
export default config;
