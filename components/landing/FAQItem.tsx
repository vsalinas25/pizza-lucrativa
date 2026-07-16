"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-md border border-creme-200 overflow-hidden">
      <button
        onClick={() => setAberto((a) => !a)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        aria-expanded={aberto}
      >
        <span className="font-medium text-tinta-950 text-sm sm:text-base">{pergunta}</span>
        <ChevronDown
          className={`h-4 w-4 text-tinta-400 shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>
      {aberto && <p className="px-4 pb-4 text-tinta-400 text-sm">{resposta}</p>}
    </div>
  );
}
