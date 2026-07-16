import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Space Grotesk: geométrica, caráter distinto (referência tech/fintech
// moderna) para headings — mais memorável que uma sans genérica.
const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
// DM Sans: par pensado para Space Grotesk — leitura limpa para corpo e dados.
const fontBody = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
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
