"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    router.push(params.get("redirect") ?? "/dashboard");
  }

  async function recuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/redefinir-senha`,
    });
    setCarregando(false);
    setMensagem(error ? error.message : "Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full">
        <h1 className="font-display text-2xl font-semibold mb-6">
          {modoRecuperar ? "Recuperar senha" : "Entrar"}
        </h1>

        <form onSubmit={modoRecuperar ? recuperarSenha : entrar} className="space-y-4">
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
          {!modoRecuperar && (
            <div>
              <label className="text-sm text-trigo-200 block mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-md bg-carvao-800 border border-carvao-700 px-3.5 py-2.5 text-trigo-50 outline-none focus:border-brasa-400"
              />
            </div>
          )}
          {erro && <p className="text-sinal-vermelho text-sm">{erro}</p>}
          {mensagem && <p className="text-sinal-verde text-sm">{mensagem}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-brasa-500 hover:bg-brasa-600 disabled:opacity-60 text-carvao-950 font-semibold py-2.5 transition-colors"
          >
            {carregando ? "..." : modoRecuperar ? "Enviar link" : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => setModoRecuperar((m) => !m)}
          className="text-sm text-trigo-400 hover:text-trigo-200 mt-4"
        >
          {modoRecuperar ? "Voltar para login" : "Esqueci minha senha"}
        </button>
      </div>
    </main>
  );
}
