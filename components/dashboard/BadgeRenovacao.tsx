"use client";

async function iniciarRenovacao() {
  const res = await fetch("/api/renovacao", { method: "POST" });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function BadgeRenovacao({ renovacaoAtiva }: { renovacaoAtiva: boolean }) {
  if (renovacaoAtiva) {
    return (
      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sinal-verde/15 text-sinal-verde">
        Taxas atualizadas
      </span>
    );
  }

  return (
    <button
      onClick={iniciarRenovacao}
      className="text-xs font-mono px-2.5 py-1.5 rounded-full border border-creme-200 text-tinta-400 hover:border-menta-600 hover:text-menta-600 transition-colors"
      title="Seu dashboard funciona normalmente. Isto só atualiza taxas de plataforma e libera novidades."
    >
      Atualizar taxas de plataforma — R$97/ano
    </button>
  );
}
