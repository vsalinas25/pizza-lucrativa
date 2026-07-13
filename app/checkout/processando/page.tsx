"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, QrCode } from "lucide-react";

type StatusPagamento = "verificando" | "aguardando_pix" | "confirmado" | "erro";

/**
 * Página pós-checkout. Card confirma quase na hora; PIX pode levar de
 * segundos a poucos minutos. Fazemos polling em /api/checkout/status —
 * nunca deixamos o cliente numa tela travada sem feedback.
 */
export default function ProcessandoPage() {
  return (
    <Suspense fallback={null}>
      <ProcessandoConteudo />
    </Suspense>
  );
}

function ProcessandoConteudo() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<StatusPagamento>("verificando");
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("erro");
      return;
    }

    let ativo = true;
    let tentativas = 0;

    async function verificar() {
      const res = await fetch(`/api/checkout/status?session_id=${sessionId}`);
      const data = await res.json();

      if (!ativo) return;

      if (data.payment_status === "paid") {
        setStatus("confirmado");
        router.push(`/checkout/criar-conta?session_id=${sessionId}`);
        return;
      }

      if (data.pix_qr_code) setQrCode(data.pix_qr_code);
      setStatus("aguardando_pix");

      tentativas += 1;
      if (tentativas < 40) {
        // até ~3-4min de polling com backoff leve
        setTimeout(verificar, tentativas < 10 ? 3000 : 6000);
      }
    }

    verificar();
    return () => {
      ativo = false;
    };
  }, [sessionId, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        {status === "verificando" && (
          <>
            <Loader2 className="h-8 w-8 text-brasa-400 animate-spin mx-auto mb-4" />
            <p className="text-trigo-200">Confirmando seu pagamento...</p>
          </>
        )}

        {status === "aguardando_pix" && (
          <>
            <QrCode className="h-8 w-8 text-brasa-400 mx-auto mb-4" />
            <h1 className="font-display text-xl font-semibold mb-2">Aguardando confirmação do PIX</h1>
            <p className="text-trigo-400 text-sm mb-4">
              Assim que o pagamento cair, você entra direto no seu dashboard. Não feche esta página.
            </p>
            {qrCode && (
              <div className="bg-white p-3 rounded-md inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR code do PIX" className="h-48 w-48" />
              </div>
            )}
          </>
        )}

        {status === "erro" && (
          <>
            <p className="text-sinal-vermelho font-medium mb-2">Não encontramos essa sessão de pagamento.</p>
            <p className="text-trigo-400 text-sm">
              Se você já pagou, entre em contato pelo suporte com o comprovante.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
