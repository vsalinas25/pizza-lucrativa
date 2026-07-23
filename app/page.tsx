import {
  TrendingDown,
  Radar,
  Dices,
  Notebook,
  Calculator,
  Route,
  SlidersHorizontal,
  Lightbulb,
  LayoutDashboard,
  Gauge,
  ListOrdered,
  GraduationCap,
  Infinity as InfinityIcon,
  Wallet,
  Target,
  PencilLine,
} from "lucide-react";
import BotaoComprar from "@/components/landing/BotaoComprar";
import VSLPlayer from "@/components/landing/VSLPlayer";
import FAQItem from "@/components/landing/FAQItem";

const DORES = [
  { icone: TrendingDown, texto: "Você fatura bem no fim do mês, mas sobra pouco — e não sabe explicar por quê." },
  { icone: Radar, texto: "Não sabe se o iFood está comendo sua margem ou se ainda vale a pena estar lá." },
  { icone: Dices, texto: "Cada pizza nova no cardápio é um chute de preço — sem saber o CMV real dela." },
  { icone: Notebook, texto: "Você tem planilha, mas ela não te diz o que fazer — só mostra números soltos." },
];

const METODO = [
  { icone: Calculator, t: "CMV real por pizza", d: "O que cada pizza custa de verdade — ficha técnica completa, editável a qualquer momento.", destaque: true },
  { icone: Wallet, t: "Lucro em R$, não só em %", d: "Além do CMV, você vê exatamente quanto sobra em reais por pizza, em cada canal." },
  { icone: Route, t: "Preço por canal", d: "Site, iFood, Keeta, 99Food — cada um com sua taxa real, cada um com seu preço certo." },
  { icone: SlidersHorizontal, t: "Simulação de margem", d: "Define a margem que quer e vê o preço mínimo pra chegar lá." },
  { icone: Target, t: "Quanto preciso vender?", d: "Diz o quanto quer faturar, lucrar ou cobrir de despesa fixa — a ferramenta calcula quantas pizzas por dia." },
  { icone: Lightbulb, t: "Ação sugerida", d: "Quando o preço ideal não cabe no mercado, a ferramenta sugere a alavanca certa." },
];

const INCLUSOS = [
  { icone: LayoutDashboard, texto: "Dashboard completo de CMV e margem por canal" },
  { icone: PencilLine, texto: "Cadastro e edição ilimitada de pizzas, custos e taxas de canal" },
  { icone: Wallet, texto: "Lucro por pizza em R$ e em %, canal por canal" },
  { icone: Target, texto: "Simulador de meta: quantas pizzas pra bater faturamento, lucro ou despesas" },
  { icone: Gauge, texto: "Simulador de margem em tempo real" },
  { icone: ListOrdered, texto: "Ranking de piores ofensores de margem" },
  { icone: GraduationCap, texto: "Mini-curso embutido explicando cada número" },
  { icone: InfinityIcon, texto: "Acesso vitalício — nunca expira, nunca bloqueia" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section className="relative px-5 pt-10 pb-8 sm:px-8 sm:pt-16 lg:pt-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          <div className="animate-fade-up">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-menta-600 mb-3">
              Para donos de pizzaria
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-tinta-950 tracking-tight">
              Você fatura bem. Mas nunca sabe exatamente{" "}
              <span className="bg-gradient-to-r from-menta-500 to-menta-600 bg-clip-text text-transparent">
                quanto cada pizza deixa
              </span>{" "}
              no seu bolso.
            </h1>
            <p className="mt-5 text-tinta-400 text-base sm:text-lg max-w-xl">
              Uma ferramenta — não uma planilha de contador — que calcula seu CMV real,
              quanto sobra em reais por pizza em cada canal (site, iFood, Keeta, 99Food)
              e quantas pizzas você precisa vender pra bater sua meta do mês.
            </p>

            <div className="mt-7">
              <VSLPlayer />
            </div>

            <div className="mt-5 sticky bottom-4 sm:static sm:mt-7 z-20">
              <BotaoComprar texto="Quero calcular minha margem real — R$297" tamanho="grande" />
              <p className="text-center sm:text-left text-xs text-tinta-400 mt-2">
                Pagamento único · Acesso vitalício · Cartão ou PIX
              </p>
            </div>
          </div>

          {/* Preview "ao vivo" do dashboard — dá gosto na oferta antes do vídeo */}
          <div className="hidden lg:block animate-fade-up [animation-delay:150ms]">
            <div className="rounded-xl border border-creme-200 bg-white shadow-card p-5 rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold text-sm text-tinta-950">Vitto & Giulio Pizza</p>
                <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-menta-50 text-menta-600">
                  ao vivo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-creme-50 p-3">
                  <p className="font-mono text-2xl font-semibold text-sinal-vermelho tabular-nums">44,6%</p>
                  <p className="text-[11px] text-tinta-400 mt-0.5">CMV médio</p>
                </div>
                <div className="rounded-md bg-creme-50 p-3">
                  <p className="font-mono text-2xl font-semibold text-menta-600 tabular-nums">12,4%</p>
                  <p className="text-[11px] text-tinta-400 mt-0.5">Margem líquida</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { nome: "Margherita — iFood", cmv: 51, nivel: "vermelho" as const },
                  { nome: "Calabresa — Site", cmv: 34, nivel: "amarelo" as const },
                  { nome: "Quatro Queijos — 99Food", cmv: 27, nivel: "verde" as const },
                ].map((p) => (
                  <div key={p.nome} className="flex items-center justify-between rounded-md bg-creme-50 px-3 py-2">
                    <span className="text-xs text-tinta-700">{p.nome}</span>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        p.nivel === "vermelho"
                          ? "text-sinal-vermelho"
                          : p.nivel === "amarelo"
                          ? "text-sinal-amarelo"
                          : "text-sinal-verde"
                      }`}
                    >
                      {p.cmv}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOR — bento 2x2 */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 max-w-6xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8 tracking-tight">
          Reconhece alguma dessas situações?
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {DORES.map(({ icone: Icone, texto }) => (
            <div
              key={texto}
              className="flex gap-4 items-start rounded-lg border border-creme-200 bg-white p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="shrink-0 h-9 w-9 rounded-md bg-menta-50 flex items-center justify-center">
                <Icone className="h-5 w-5 text-menta-600" strokeWidth={2} />
              </span>
              <span className="text-tinta-700 text-sm sm:text-base leading-relaxed">{texto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROVA REAL */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 bg-creme-100">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-menta-600 mb-2">
            Caso real
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8 tracking-tight">
            Vitto & Giulio, São Paulo
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mb-6">
            <div className="rounded-lg bg-white p-5 shadow-soft">
              <p className="font-mono text-3xl sm:text-4xl font-semibold text-sinal-vermelho tabular-nums">
                44,56%
              </p>
              <p className="text-sm text-tinta-400 mt-1">CMV real identificado — bem acima do saudável</p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow-soft">
              <p className="font-mono text-3xl sm:text-4xl font-semibold text-menta-600 tabular-nums">2</p>
              <p className="text-sm text-tinta-400 mt-1">Canais com gap de precificação descoberto</p>
            </div>
          </div>
          <p className="text-tinta-700 max-w-xl">
            Foi assim que essa ferramenta nasceu — resolvendo esse problema pra dentro,
            antes de virar produto. Ainda estamos no início: os primeiros usuários
            externos entram agora, com preço de fundador.
          </p>
        </div>
      </section>

      {/* MÉTODO — bento assimétrico */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 max-w-6xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8 tracking-tight">
          O que a ferramenta calcula
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METODO.map(({ icone: Icone, t, d, destaque }) => (
            <div
              key={t}
              className={`rounded-lg border p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 ${
                destaque
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-1 bg-gradient-to-br from-menta-50 to-white border-menta-100"
                  : "border-creme-200 bg-white"
              }`}
            >
              <span className="inline-flex h-10 w-10 rounded-md bg-menta-500 items-center justify-center mb-4">
                <Icone className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
              <h3 className="font-display text-lg font-semibold text-tinta-950 mb-1">{t}</h3>
              <p className="text-tinta-400 text-sm">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFERTA */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 bg-creme-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 tracking-tight">
              O que está incluso
            </h2>
            <p className="text-tinta-400 mb-6">Menos que uma pizza grande por mês no primeiro ano.</p>
            <ul className="space-y-3">
              {INCLUSOS.map(({ icone: Icone, texto }) => (
                <li key={texto} className="flex gap-3 items-center text-tinta-700">
                  <span className="shrink-0 h-7 w-7 rounded-full bg-menta-500 flex items-center justify-center">
                    <Icone className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-menta-200 bg-white p-6 sm:p-8 shadow-card">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="font-display text-3xl font-semibold text-tinta-950">R$297</p>
              <p className="text-tinta-400 text-sm">pagamento único</p>
            </div>
            <p className="text-tinta-400 text-sm mb-6">
              Renovação anual opcional de R$97 mantém as taxas de plataforma
              (iFood, Keeta, 99Food) atualizadas e libera novas funcionalidades.{" "}
              <strong className="text-tinta-700">
                Sem renovação, seu dashboard continua funcionando normalmente com os dados que você já configurou.
              </strong>
            </p>
            <BotaoComprar texto="Quero acesso vitalício — R$297" tamanho="grande" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 sm:px-8 py-14 border-t border-creme-200 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8 tracking-tight">
          Perguntas antes de comprar
        </h2>
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
      <section className="px-5 sm:px-8 py-16 border-t border-creme-200 text-center bg-gradient-to-b from-creme-50 to-menta-50">
        <h2 className="font-display text-2xl sm:text-4xl font-semibold mb-6 max-w-lg mx-auto tracking-tight">
          Descubra o que cada pizza realmente deixa no seu bolso.
        </h2>
        <div className="flex justify-center">
          <BotaoComprar texto="Quero acesso vitalício — R$297" tamanho="grande" />
        </div>
      </section>

      <footer className="px-5 sm:px-8 py-6 border-t border-creme-200 text-center">
        <a href="/termos" className="text-xs text-tinta-400 hover:text-tinta-700 underline">
          Termos de uso, privacidade e política de reembolso
        </a>
      </footer>
    </main>
  );
}
