import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Fraunces: serifa com caráter (referência ao carimbo de forno, sem cair
// no clichê itálico-de-cardápio) para headings.
const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
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
      <body className="bg-carvao-950 text-trigo-50 font-body antialiased">{children}</body>
    </html>
  );
}
