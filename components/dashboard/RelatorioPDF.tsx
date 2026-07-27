import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { DadosRelatorio } from "@/lib/relatorio";

// Fontes da própria marca (Space Grotesk / DM Sans / JetBrains Mono) via
// fontsource — react-pdf não usa a fonte do sistema, precisa do arquivo.
// Se o registro falhar (ex: sem rede no momento da geração), o react-pdf
// cai de volta pra Helvetica sozinho — não quebra o download.
Font.register({
  family: "Space Grotesk",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.ttf", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-500-normal.ttf", fontWeight: 500 },
  ],
});
Font.register({
  family: "DM Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-700-normal.ttf", fontWeight: 700 },
  ],
});
Font.register({
  family: "JetBrains Mono",
  fonts: [{ src: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-600-normal.ttf", fontWeight: 600 }],
});

// Paleta igual à do app (tailwind.config.ts) — o relatório precisa parecer
// a mesma marca do dashboard, não um PDF genérico à parte.
const cores = {
  tinta: "#1c1c18",
  tintaClara: "#6b6a5f",
  menta: "#2f9e6e",
  mentaClaro: "#eaf6f0",
  indigo: "#5b5bd6",
  amarelo: "#b8860b",
  amareloClaro: "#fbf3e0",
  vermelho: "#c0392b",
  vermelhoClaro: "#fbeae8",
  creme: "#faf9f5",
  linha: "#e8e6dd",
  branco: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 50,
    paddingHorizontal: 34,
    fontSize: 9,
    fontFamily: "DM Sans",
    color: cores.tinta,
  },
  faixaTopo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: cores.tinta,
    paddingHorizontal: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marca: { fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 700, color: cores.branco },
  marcaSub: { fontSize: 8, color: "#c9c7ba", marginTop: 2 },
  faixaDireita: { alignItems: "flex-end" },
  faixaTitulo: { fontFamily: "Space Grotesk", fontSize: 10, fontWeight: 700, color: cores.branco },
  faixaSub: { fontSize: 7.5, color: "#c9c7ba", marginTop: 2 },

  secao: { marginBottom: 18 },
  tituloSecaoLinha: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  barraTitulo: { width: 3, height: 12, backgroundColor: cores.menta, borderRadius: 2 },
  tituloSecao: { fontFamily: "Space Grotesk", fontSize: 12.5, fontWeight: 700 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    width: "23%",
    backgroundColor: cores.creme,
    borderRadius: 6,
    borderLeft: `2.5pt solid ${cores.menta}`,
    padding: 9,
    marginBottom: 8,
  },
  cardValor: { fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 600 },
  cardLabel: { fontSize: 7, color: cores.tintaClara, marginTop: 3, lineHeight: 1.3 },

  tabelaWrap: { borderRadius: 6, overflow: "hidden", border: `0.5pt solid ${cores.linha}` },
  cabecalhoTabela: {
    flexDirection: "row",
    backgroundColor: cores.tinta,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  thTexto: { fontSize: 7.5, fontFamily: "DM Sans", fontWeight: 700, color: cores.branco, textTransform: "uppercase" },
  linhaTabela: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `0.5pt solid ${cores.linha}`,
    alignItems: "center",
  },
  linhaTabelaPar: { backgroundColor: cores.creme },
  tdTexto: { fontSize: 8.5 },
  tdMono: { fontSize: 8.5, fontFamily: "JetBrains Mono" },

  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  sinalCelula: { flexDirection: "row", alignItems: "center" },

  bullet: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: cores.creme,
    borderRadius: 6,
    padding: 9,
    alignItems: "flex-start",
  },
  bulletNumero: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: cores.menta,
    color: cores.branco,
    fontFamily: "Space Grotesk",
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 3.5,
    marginRight: 8,
  },
  bulletTexto: { flex: 1, fontSize: 9.5, lineHeight: 1.45, paddingTop: 1 },

  rodape: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    fontSize: 7,
    color: cores.tintaClara,
    borderTop: `0.5pt solid ${cores.linha}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function corSinal(sinal: string) {
  if (sinal === "verde") return cores.menta;
  if (sinal === "amarelo") return cores.amarelo;
  if (sinal === "vermelho") return cores.vermelho;
  return cores.tintaClara;
}

function SinalDot({ sinal }: { sinal: string }) {
  return <View style={[styles.dot, { backgroundColor: corSinal(sinal) }]} />;
}

function pct(v: number | null, casas = 1) {
  return v === null ? "-" : `${(v * 100).toFixed(casas)}%`;
}

function moeda(v: number | null) {
  return v === null ? "-" : `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function Cabecalho({ pizzariaNome, secaoAtual }: { pizzariaNome: string; secaoAtual: string }) {
  return (
    <View style={styles.faixaTopo} fixed>
      <View>
        <Text style={styles.marca}>Precifique Sua Pizza</Text>
        <Text style={styles.marcaSub}>Relatório de CMV, margem e metas</Text>
      </View>
      <View style={styles.faixaDireita}>
        <Text style={styles.faixaTitulo}>{pizzariaNome}</Text>
        <Text style={styles.faixaSub}>{secaoAtual}</Text>
      </View>
    </View>
  );
}

function Rodape({ geradoEm }: { geradoEm: string }) {
  return (
    <View style={styles.rodape} fixed>
      <Text>Gerado em {geradoEm} com os dados cadastrados no momento do download</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function TituloSecao({ children }: { children: string }) {
  return (
    <View style={styles.tituloSecaoLinha}>
      <View style={styles.barraTitulo} />
      <Text style={styles.tituloSecao}>{children}</Text>
    </View>
  );
}

export default function RelatorioPDF({ dados, geradoEm }: { dados: DadosRelatorio; geradoEm: string }) {
  const { resumoFinanceiro: r } = dados;
  const corCmv = r.cmvMedio !== null && r.cmvMedio > 0.38 ? cores.vermelho : r.cmvMedio !== null && r.cmvMedio > 0.3 ? cores.amarelo : cores.menta;
  const corMargem = r.margemMediaProjetada !== null && r.margemMediaProjetada < 0 ? cores.vermelho : cores.menta;

  return (
    <Document title={`Relatório — ${dados.pizzariaNome}`}>
      <Page size="A4" style={styles.page}>
        <Cabecalho pizzariaNome={dados.pizzariaNome} secaoAtual="Resumo financeiro e plano de ação" />

        <View style={styles.secao}>
          <TituloSecao>Resumo financeiro</TituloSecao>
          <View style={styles.grid}>
            <View style={[styles.card, { borderLeftColor: corCmv }]}>
              <Text style={[styles.cardValor, { color: corCmv }]}>{pct(r.cmvMedio)}</Text>
              <Text style={styles.cardLabel}>CMV médio{"\n"}ponderado pelo faturamento</Text>
            </View>
            <View style={[styles.card, { borderLeftColor: corMargem }]}>
              <Text style={[styles.cardValor, { color: corMargem }]}>{pct(r.margemMediaProjetada)}</Text>
              <Text style={styles.cardLabel}>Margem líquida{"\n"}projetada</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>{moeda(r.sobraMediaPorPizza)}</Text>
              <Text style={styles.cardLabel}>Sobra média{"\n"}por pizza vendida</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>{moeda(r.despesasFixasTotais)}</Text>
              <Text style={styles.cardLabel}>Despesas fixas{"\n"}por mês</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>{r.breakEven ? `${r.breakEven.unidadesMes}` : "-"}</Text>
              <Text style={styles.cardLabel}>
                Pizzas/mês pro break-even{r.breakEven ? ` (~${r.breakEven.unidadesDia}/dia)` : ""}
              </Text>
            </View>
            <View style={[styles.card, { borderLeftColor: cores.menta }]}>
              <Text style={[styles.cardValor, { fontSize: 12, color: cores.menta }]}>{r.melhorCanal ? r.melhorCanal.nome : "-"}</Text>
              <Text style={styles.cardLabel}>
                Melhor canal{r.melhorCanal ? ` — ${pct(r.melhorCanal.margemMediaPct)} margem média` : ""}
              </Text>
            </View>
            <View style={[styles.card, { borderLeftColor: cores.vermelho }]}>
              <Text style={[styles.cardValor, { fontSize: 12, color: cores.vermelho }]}>{r.piorCanal ? r.piorCanal.nome : "-"}</Text>
              <Text style={styles.cardLabel}>
                Pior canal{r.piorCanal ? ` — ${pct(r.piorCanal.margemMediaPct)} margem média` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.secao}>
          <TituloSecao>Metas de venda (mix atual de pizzas e canais)</TituloSecao>
          <View style={styles.tabelaWrap}>
            <View style={styles.cabecalhoTabela}>
              <Text style={[styles.thTexto, { width: "34%" }]}>Meta</Text>
              <Text style={[styles.thTexto, { width: "22%" }]}>Pizzas / mês</Text>
              <Text style={[styles.thTexto, { width: "22%" }]}>Pizzas / dia</Text>
              <Text style={[styles.thTexto, { width: "22%" }]}>Faturamento</Text>
            </View>
            {dados.metas.map((m, i) => (
              <View key={m.label} style={[styles.linhaTabela, i % 2 === 1 ? styles.linhaTabelaPar : {}]}>
                <Text style={[styles.tdTexto, { width: "34%" }]}>{m.label}</Text>
                <Text style={[styles.tdMono, { width: "22%", color: cores.menta }]}>{m.unidadesMes}</Text>
                <Text style={[styles.tdMono, { width: "22%" }]}>~{m.unidadesDia}</Text>
                <Text style={[styles.tdMono, { width: "22%" }]}>{moeda(m.faturamentoResultante)}</Text>
              </View>
            ))}
            {dados.metas.length === 0 && (
              <Text style={[styles.tdTexto, { padding: 8 }]}>Sem dados suficientes pra calcular metas.</Text>
            )}
          </View>
        </View>

        <View style={styles.secao}>
          <TituloSecao>Plano de ação — prioridades</TituloSecao>
          {dados.planoDeAcao.map((acao, i) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletNumero}>{i + 1}</Text>
              <Text style={styles.bulletTexto}>{acao}</Text>
            </View>
          ))}
        </View>

        <Rodape geradoEm={geradoEm} />
      </Page>

      {/* RENTABILIDADE PIZZA × CANAL */}
      <Page size="A4" style={styles.page}>
        <Cabecalho pizzariaNome={dados.pizzariaNome} secaoAtual="Rentabilidade por pizza e canal" />
        <TituloSecao>Rentabilidade por pizza x canal</TituloSecao>
        <View style={styles.tabelaWrap}>
          <View style={styles.cabecalhoTabela}>
            <Text style={[styles.thTexto, { width: "22%" }]}>Pizza</Text>
            <Text style={[styles.thTexto, { width: "16%" }]}>Canal</Text>
            <Text style={[styles.thTexto, { width: "16%" }]}>Preço atual</Text>
            <Text style={[styles.thTexto, { width: "16%" }]}>Preço recom.</Text>
            <Text style={[styles.thTexto, { width: "15%" }]}>CMV</Text>
            <Text style={[styles.thTexto, { width: "15%" }]}>Sobra (R$)</Text>
          </View>
          {dados.rentabilidadePorPizza.flatMap((pizza, pi) =>
            pizza.celulas.map((cel, i) => (
              <View
                key={`${pizza.pizzaNome}-${cel.canalNome}`}
                style={[styles.linhaTabela, (pi * pizza.celulas.length + i) % 2 === 1 ? styles.linhaTabelaPar : {}]}
              >
                <Text style={[styles.tdTexto, { width: "22%", fontFamily: "DM Sans", fontWeight: i === 0 ? 700 : 400 }]}>
                  {i === 0 ? pizza.pizzaNome : ""}
                </Text>
                <Text style={[styles.tdTexto, { width: "16%", color: cores.tintaClara }]}>{cel.canalNome}</Text>
                <Text style={[styles.tdMono, { width: "16%" }]}>{cel.temPreco ? moeda(cel.precoAtual) : "sem preço"}</Text>
                <Text style={[styles.tdMono, { width: "16%" }]}>{cel.temPreco ? moeda(cel.precoRecomendado) : "-"}</Text>
                <View style={[styles.sinalCelula, { width: "15%" }]}>
                  {cel.temPreco && <SinalDot sinal={cel.sinal} />}
                  <Text style={[styles.tdMono, { color: corSinal(cel.sinal) }]}>{cel.temPreco ? pct(cel.cmv) : "-"}</Text>
                </View>
                <Text style={[styles.tdMono, { width: "15%" }]}>{cel.temPreco ? moeda(cel.sobra) : "-"}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
          <View style={styles.sinalCelula}>
            <SinalDot sinal="verde" />
            <Text style={{ fontSize: 7.5, color: cores.tintaClara }}>até 30% CMV — saudável</Text>
          </View>
          <View style={styles.sinalCelula}>
            <SinalDot sinal="amarelo" />
            <Text style={{ fontSize: 7.5, color: cores.tintaClara }}>30-38% — atenção</Text>
          </View>
          <View style={styles.sinalCelula}>
            <SinalDot sinal="vermelho" />
            <Text style={{ fontSize: 7.5, color: cores.tintaClara }}>acima de 38% — crítico</Text>
          </View>
        </View>
        <Text style={{ fontSize: 7.5, color: cores.tintaClara, marginTop: 4 }}>
          Preço recomendado calculado para CMV-alvo de 30%, respeitando o teto de mercado quando definido.
        </Text>
        <Rodape geradoEm={geradoEm} />
      </Page>

      {/* RANKING */}
      <Page size="A4" style={styles.page}>
        <Cabecalho pizzariaNome={dados.pizzariaNome} secaoAtual="Ranking de problemas e oportunidades" />

        <View style={styles.secao}>
          <TituloSecao>Piores combinações pizza x canal</TituloSecao>
          <View style={styles.tabelaWrap}>
            <View style={styles.cabecalhoTabela}>
              <Text style={[styles.thTexto, { width: "34%" }]}>Pizza</Text>
              <Text style={[styles.thTexto, { width: "26%" }]}>Canal</Text>
              <Text style={[styles.thTexto, { width: "20%" }]}>CMV</Text>
              <Text style={[styles.thTexto, { width: "20%" }]}>Sobra (R$)</Text>
            </View>
            {dados.ranking.pioresCombos.map((c, i) => (
              <View key={i} style={[styles.linhaTabela, i % 2 === 1 ? styles.linhaTabelaPar : {}]}>
                <Text style={[styles.tdTexto, { width: "34%" }]}>{c.pizzaNome}</Text>
                <Text style={[styles.tdTexto, { width: "26%", color: cores.tintaClara }]}>{c.canalNome}</Text>
                <View style={[styles.sinalCelula, { width: "20%" }]}>
                  <SinalDot sinal={c.sinal} />
                  <Text style={[styles.tdMono, { color: corSinal(c.sinal) }]}>{pct(c.cmv)}</Text>
                </View>
                <Text style={[styles.tdMono, { width: "20%" }]}>{moeda(c.sobra)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.secao}>
          <TituloSecao>Combinações mais rentáveis</TituloSecao>
          <View style={styles.tabelaWrap}>
            <View style={styles.cabecalhoTabela}>
              <Text style={[styles.thTexto, { width: "34%" }]}>Pizza</Text>
              <Text style={[styles.thTexto, { width: "26%" }]}>Canal</Text>
              <Text style={[styles.thTexto, { width: "20%" }]}>CMV</Text>
              <Text style={[styles.thTexto, { width: "20%" }]}>Sobra (R$)</Text>
            </View>
            {dados.ranking.melhoresCombos.map((c, i) => (
              <View key={i} style={[styles.linhaTabela, i % 2 === 1 ? styles.linhaTabelaPar : {}]}>
                <Text style={[styles.tdTexto, { width: "34%" }]}>{c.pizzaNome}</Text>
                <Text style={[styles.tdTexto, { width: "26%", color: cores.tintaClara }]}>{c.canalNome}</Text>
                <View style={[styles.sinalCelula, { width: "20%" }]}>
                  <SinalDot sinal={c.sinal} />
                  <Text style={[styles.tdMono, { color: corSinal(c.sinal) }]}>{pct(c.cmv)}</Text>
                </View>
                <Text style={[styles.tdMono, { width: "20%", color: cores.menta }]}>{moeda(c.sobra)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.secao}>
          <TituloSecao>Pizzas com CMV excessivo (media acima de 38%)</TituloSecao>
          {dados.ranking.cmvExcessivo.length === 0 ? (
            <Text style={[styles.tdTexto, { color: cores.tintaClara }]}>Nenhuma pizza com CMV médio crítico.</Text>
          ) : (
            <View style={styles.tabelaWrap}>
              {dados.ranking.cmvExcessivo.map((p, i) => (
                <View key={i} style={[styles.linhaTabela, i % 2 === 1 ? styles.linhaTabelaPar : {}]}>
                  <Text style={[styles.tdTexto, { width: "60%" }]}>{p.pizzaNome}</Text>
                  <Text style={[styles.tdMono, { width: "20%", color: cores.vermelho }]}>{pct(p.cmvMedio)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.secao}>
          <TituloSecao>Maior potencial de melhorar margem</TituloSecao>
          {dados.ranking.maiorPotencial.length === 0 ? (
            <Text style={[styles.tdTexto, { color: cores.tintaClara }]}>Sem oportunidades óbvias de ajuste de preço no momento.</Text>
          ) : (
            <View style={styles.tabelaWrap}>
              {dados.ranking.maiorPotencial.map((c, i) => (
                <View key={i} style={[styles.linhaTabela, i % 2 === 1 ? styles.linhaTabelaPar : {}]}>
                  <Text style={[styles.tdTexto, { width: "30%" }]}>{c.pizzaNome}</Text>
                  <Text style={[styles.tdTexto, { width: "20%", color: cores.tintaClara }]}>{c.canalNome}</Text>
                  <Text style={[styles.tdMono, { width: "30%" }]}>
                    {moeda(c.precoAtual)} para {moeda(c.precoRecomendado)}
                  </Text>
                  <Text style={[styles.tdMono, { width: "20%", color: cores.menta }]}>+{moeda(c.ganhoPotencial)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Rodape geradoEm={geradoEm} />
      </Page>
    </Document>
  );
}
