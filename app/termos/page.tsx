import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso e Política de Reembolso — Precifique Sua Pizza",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 max-w-2xl mx-auto">
      <a href="/" className="text-sm text-menta-600 hover:underline">
        ← Voltar
      </a>

      <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-4 mb-8">
        Termos de Uso, Privacidade e Política de Reembolso
      </h1>

      <div className="space-y-8 text-tinta-700 text-sm leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-tinta-950 mb-2">
            1. O que você está comprando
          </h2>
          <p>
            O <strong>Precifique Sua Pizza</strong> é uma ferramenta digital (dashboard web) de cálculo
            de CMV e precificação por canal de venda, com conteúdo educacional embutido. A compra
            inicial de <strong>R$297</strong> é um pagamento único que dá acesso vitalício ao dashboard —
            esse acesso nunca expira e nunca é bloqueado por falta de pagamento futuro.
          </p>
          <p className="mt-2">
            A renovação anual opcional de <strong>R$97</strong> não é uma assinatura nem cobrança
            automática recorrente. Ela só é cobrada quando você mesmo inicia o pagamento pelo botão
            correspondente no dashboard, e libera exclusivamente: (a) atualização automática das
            comissões-padrão de plataformas de delivery (iFood, Keeta, 99Food), e (b) acesso a
            funcionalidades lançadas depois da sua compra original. Nunca renovar não afeta o uso do
            que você já configurou.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-tinta-950 mb-2">
            2. Política de reembolso — garantia de 7 dias
          </h2>
          <p>
            Conforme o Art. 49 do Código de Defesa do Consumidor (direito de arrependimento em
            compras realizadas fora do estabelecimento comercial, incluindo a internet), você tem{" "}
            <strong>7 dias corridos</strong> a partir da data da compra para solicitar reembolso
            integral, sem necessidade de justificativa.
          </p>
          <p className="mt-2">
            Para solicitar, envie um e-mail para{" "}
            <span className="text-menta-600">hello@victorsalinas.co</span> com o e-mail
            usado na compra. O reembolso é processado pela mesma forma de pagamento utilizada
            (cartão ou PIX) em até alguns dias úteis, conforme prazo do seu banco ou operadora.
          </p>
          <p className="mt-2">
            Após os 7 dias, a compra do acesso vitalício não é reembolsável — a renovação anual,
            por não ser cobrança recorrente, também segue a mesma janela de 7 dias a partir de cada
            pagamento realizado.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-tinta-950 mb-2">
            3. Dados que coletamos e como usamos
          </h2>
          <p>
            Coletamos o e-mail usado na compra (via Stripe) e os dados que você mesmo cadastra no
            onboarding e no dashboard: dados da sua pizzaria, canais de venda, fichas técnicas e
            preços das suas pizzas. Esses dados existem exclusivamente para o funcionamento da
            ferramenta — calcular seu CMV e suas margens — e são isolados por conta: nenhum outro
            usuário tem acesso aos seus dados.
          </p>
          <p className="mt-2">
            Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing. Os
            dados de pagamento (número de cartão, etc.) nunca passam pelos nossos servidores — são
            processados diretamente pelo Stripe, processador de pagamentos certificado PCI-DSS.
          </p>
          <p className="mt-2">
            Você pode solicitar a exclusão completa da sua conta e dados a qualquer momento pelo
            e-mail de suporte acima, conforme seus direitos garantidos pela LGPD (Lei Geral de
            Proteção de Dados).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-tinta-950 mb-2">4. Contato</h2>
          <p>
            Achievement Tecnologia Digital LTDA — CNPJ 10.667.458/0001-52
            <br />
            Suporte: <span className="text-menta-600">hello@victorsalinas.co</span>
          </p>
        </section>
      </div>
    </main>
  );
}
