import BotaoComprar from "@/components/landing/BotaoComprar";
import VSLPlayer from "@/components/landing/VSLPlayer";
import FAQItem from "@/components/landing/FAQItem";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative px-5 pt-10 pb-8 sm:px-8 sm:pt-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-menta-600 mb-3">
          Para donos de pizzaria
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-[1.1] text-tinta-950 max-w-2xl">
          Você fatura bem. Mas nunca sabe exatamente{" "}
          <span className="text-menta-600">quanto cada pizza deixa</span> no seu bolso.
        </h1>
        <p className="mt-4 text-tinta-400 text-base sm:text-lg max-w-xl">
          Uma ferramenta — não uma planilha de contador — que calcula seu CMV real
          e o preço certo por canal: site, iFood, Keeta e 99Food.
        </p>

        <div className="mt-6">
          <VSLPlayer />
        </div>

        <div className="mt-5 sticky bottom-4 sm:static sm:mt-6 z-20">
          <BotaoComprar texto="Quero calcular minha margem real — R$297" tamanho="grande" />
          <p className="text-center text-xs text-tinta-400 mt-2">
            Pagamento único · Acesso vitalício · Cartão ou PIX
          </p>
        </div>
      </section>

      {/* DOR */}
      <section className="px-5 sm:px-8 py-10 border-t border-creme-200">
        <h2 className="font-display text-2xl font-semibold mb-6">
          Reconhece alguma dessas situações?
        </h2>
        <ul className="space-y-4">
          {[
            "Você fatura bem no fim do mês, mas sobra pouco — e não sabe explicar por quê.",
            "Não sabe se o iFood está comendo sua margem ou se ainda vale a pena estar lá.",
            "Cada pizza nova no cardápio é um chute de preço — sem saber o CMV real dela.",
            "Você tem planilha, mas ela não te diz o que fazer — só mostra números soltos.",
          ].map((dor) => (
            <li key={dor} className="flex gap-3 items-start">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-menta-600 shrink-0" />
              <span className="text-tinta-700">{dor}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* PROVA REAL */}
      <section className="px-5 sm:px-8 py-10 border-t border-creme-200 bg-creme-100">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-menta-600 mb-2">
          Caso real
        </p>
        <h2 className="font-display text-2xl font-semibold mb-6">Vitto & Giulio, São Paulo</h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md">
          <div className="rounded-lg bg-white p-4">
            <p className="font-mono text-3xl font-semibold text-sinal-vermelho tabular-nums">
              44,56%
            </p>
            <p className="text-sm text-tinta-400 mt-1">CMV real identificado — bem acima do saudável</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="font-mono text-3xl font-semibold text-menta-600 tabular-nums">2</p>
            <p className="text-sm text-tinta-400 mt-1">Canais com gap de precificação descoberto</p>
          </div>
        </div>
        <p className="text-tinta-700 mt-6 max-w-xl">
          Foi assim que essa ferramenta nasceu — resolvendo esse problema pra dentro,
          antes de virar produto. Ainda estamos no início: os primeiros usuários
          externos entram agora, com preço de fundador.
        </p>
      </section>

      {/* MÉTODO */}
      <section className="px-5 sm:px-8 py-10 border-t border-creme-200">
        <h2 className="font-display text-2xl font-semibold mb-6">O que a ferramenta calcula</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { t: "CMV real por pizza", d: "O que cada pizza custa de verdade — ficha técnica completa." },
            { t: "Preço por canal", d: "Site, iFood, Keeta, 99Food — cada um com sua taxa, cada um com seu preço certo." },
            { t: "Simulação de margem", d: "Define a margem que quer e vê o preço mínimo pra chegar lá." },
            { t: "Ação sugerida", d: "Quando o preço ideal não cabe no mercado, a ferramenta sugere a alavanca certa." },
          ].map((item) => (
            <div key={item.t} className="rounded-lg border border-creme-200 p-5">
              <h3 className="font-display text-lg font-semibold text-menta-600 mb-1">{item.t}</h3>
              <p className="text-tinta-400 text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFERTA */}
      <section className="px-5 sm:px-8 py-10 border-t border-creme-200 bg-creme-100">
        <h2 className="font-display text-2xl font-semibold mb-2">O que está incluso</h2>
        <p className="text-tinta-400 mb-6">Menos que uma pizza grande por mês no primeiro ano.</p>
        <ul className="space-y-3 mb-6">
          {[
            "Dashboard completo de CMV e precificação por canal",
            "Simulador de margem em tempo real",
            "Ranking de piores ofensores de margem",
            "Mini-curso embutido explicando cada número",
            "Acesso vitalício — nunca expira, nunca bloqueia",
          ].map((i) => (
            <li key={i} className="flex gap-3 text-tinta-700">
              <span className="text-menta-600">✓</span> {i}
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-menta-500 p-5 mb-4">
          <p className="text-tinta-950 font-semibold">R$297 · pagamento único</p>
          <p className="text-tinta-400 text-sm mt-1">
            Renovação anual opcional de R$97 mantém as taxas de plataforma
            (iFood, Keeta, 99Food) atualizadas e libera novas funcionalidades.{" "}
            <strong className="text-tinta-700">
              Sem renovação, seu dashboard continua funcionando normalmente com os dados que você já configurou.
            </strong>
          </p>
        </div>
        <BotaoComprar texto="Quero acesso vitalício — R$297" tamanho="grande" />
      </section>

      {/* FAQ */}
      <section className="px-5 sm:px-8 py-10 border-t border-creme-200">
        <h2 className="font-display text-2xl font-semibold mb-6">Perguntas antes de comprar</h2>
        <div className="space-y-3">
          <FAQItem
            pergunta="Preciso saber de Excel ou planilha?"
            resposta="Não. Você digita seus custos e preços uma vez; a ferramenta calcula tudo. Se quiser, importa via CSV."
          />
          <FAQItem
            pergunta="Funciona pra pizzaria pequena, sem loja física?"
            resposta="Sim. O cálculo é por pizza e por canal — funciona igual pra quem só vende por delivery quanto pra quem tem salão."
          />
          <FAQItem
            pergunta="E se eu não gostar?"
            resposta="7 dias de garantia incondicional. Se não fizer sentido pro seu negócio, devolvemos 100% do valor."
          />
          <FAQItem
            pergunta="A renovação de R$97 é obrigatória?"
            resposta="Não. Ela só mantém as taxas de plataforma atualizadas e libera novidades. Sem ela, o que você já configurou continua funcionando."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-6 max-w-lg mx-auto">
          Descubra o que cada pizza realmente deixa no seu bolso.
        </h2>
        <BotaoComprar texto="Quero acesso vitalício — R$297" tamanho="grande" />
      </section>

      <footer className="px-5 sm:px-8 py-6 border-t border-creme-200 text-center">
        <a href="/termos" className="text-xs text-tinta-400 hover:text-tinta-700 underline">
          Termos de uso, privacidade e política de reembolso
        </a>
      </footer>
    </main>
  );
}
