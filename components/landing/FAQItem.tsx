"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-lg border border-creme-200 bg-white overflow-hidden shadow-soft">
      <button
        onClick={() => setAberto((a) => !a)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={aberto}
      >
        <span className="font-medium text-tinta-950 text-sm sm:text-base">{pergunta}</span>
        <ChevronDown
          className={`h-4 w-4 text-menta-600 shrink-0 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto && <p className="px-5 pb-4 text-tinta-400 text-sm animate-fade-up">{resposta}</p>}
    </div>
  );
}
