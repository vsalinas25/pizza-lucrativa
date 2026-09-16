/**
 * Logomark + wordmark do produto. Ícone é a fatia de pizza duas-tonalidades
 * (public/logo-mark.svg) — mesma arte usada no favicon, pra manter a marca
 * consistente entre a aba do navegador, a LP e o dashboard.
 */
export default function Logo({
  tamanho = "normal",
  comTexto = true,
  className = "",
}: {
  tamanho?: "pequeno" | "normal" | "grande";
  comTexto?: boolean;
  className?: string;
}) {
  const tamanhos = {
    pequeno: { icone: 22, texto: "text-sm" },
    normal: { icone: 28, texto: "text-lg" },
    grande: { icone: 36, texto: "text-2xl" },
  }[tamanho];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={tamanhos.icone} height={tamanhos.icone} />
      {comTexto && (
        <span className={`font-display font-semibold text-tinta-950 ${tamanhos.texto}`}>
          Precifique <span className="text-menta-600">Sua Pizza</span>
        </span>
      )}
    </span>
  );
}
