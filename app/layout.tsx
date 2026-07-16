import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Sora: sans-serif bold e arredondada, no espírito de fintechs modernas
// (Payard, Plutus) para headings.
const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});
// Inter: leitura limpa para corpo e dados financeiros.
const fontBody = Inter({ subsets: ["latin"], variable: "--font-body" });
// JetBrains Mono: números/tabelas de CMV — tabular figures de verdade.
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Precifique Sua Pizza — Descubra o que cada pizza realmente deixa no seu bolso",
  description:
    "Dashboard de CMV e precificação por canal (site, iFood, Keeta, 99Food) para donos de pizzaria. Compra única, acesso vitalício.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <body className="bg-creme-50 text-tinta-950 font-body antialiased">{children}</body>
    </html>
  );
}
