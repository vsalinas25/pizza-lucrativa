"use client";

import { useState } from "react";

export default function BotaoComprar({
  texto,
  tamanho = "normal",
}: {
  texto: string;
  tamanho?: "normal" | "grande";
}) {
  const [carregando, setCarregando] = useState(false);

  async function iniciarCheckout() {
    setCarregando(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setCarregando(false);
      alert("Não conseguimos abrir o pagamento agora. Tenta de novo em alguns segundos.");
    }
  }

  return (
    <button
      onClick={iniciarCheckout}
      disabled={carregando}
      className={`w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-menta-500 hover:bg-menta-600 disabled:opacity-60 text-white font-semibold transition-colors ${
        tamanho === "grande" ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
    >
      {carregando ? "Abrindo pagamento..." : texto}
    </button>
  );
}
