"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CriarContaPage() {
  return (
    <Suspense fallback={null}>
      <CriarContaForm />
    </Suspense>
  );
}

function CriarContaForm() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/checkout/email?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.email) setEmail(d.email);
      });
  }, [sessionId]);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password: senha });

    if (error || !data.user) {
      setErro(error?.message ?? "Não foi possível criar a conta.");
      setCarregando(false);
      return;
    }

    // Vincula a compra pending a este novo user_id — login automático já
    // aconteceu via signUp (sessão criada), direto pro onboarding.
    await fetch("/api/checkout/vincular-compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId: data.user.id }),
    });

    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full">
        <h1 className="font-display text-2xl font-semibold mb-1">Pagamento confirmado</h1>
        <p className="text-trigo-400 text-sm mb-6">
          Falta só criar sua senha — 30 segundos e você já está no dashboard.
        </p>

        <form onSubmit={criarConta} className="space-y-4">
          <div>
            <label className="text-sm text-trigo-200 block mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-carvao-800 border border-carvao-700 px-3.5 py-2.5 text-trigo-50 outline-none focus:border-brasa-400"
            />
          </div>
          <div>
            <label className="text-sm text-trigo-200 block mb-1.5">Crie uma senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md bg-carvao-800 border border-carvao-700 px-3.5 py-2.5 text-trigo-50 outline-none focus:border-brasa-400"
            />
          </div>
          {erro && <p className="text-sinal-vermelho text-sm">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-brasa-500 hover:bg-brasa-600 disabled:opacity-60 text-carvao-950 font-semibold py-2.5 transition-colors"
          >
            {carregando ? "Criando conta..." : "Entrar no dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
