import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DadosRelatorio } from "@/lib/relatorio";

const cores = {
  tinta: "#1a1a1a",
  cinza: "#6b6b63",
  menta: "#2f9e6e",
  amarelo: "#b8860b",
  vermelho: "#c0392b",
  linha: "#e4e2da",
  fundo: "#faf9f5",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: cores.tinta },
  cabecalho: { marginBottom: 16, borderBottom: `1pt solid ${cores.linha}`, paddingBottom: 10 },
  tituloRelatorio: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  subtitulo: { fontSize: 9, color: cores.cinza, marginTop: 2 },
  secao: { marginBottom: 16 },
  tituloSecao: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  grid4: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    width: "23%",
    backgroundColor: cores.fundo,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  cardValor: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  cardLabel: { fontSize: 7, color: cores.cinza, marginTop: 2 },
  tabela: { marginTop: 4 },
  linhaTabela: { flexDirection: "row", borderBottom: `0.5pt solid ${cores.linha}`, paddingVertical: 4 },
  cabecalhoTabela: {
    flexDirection: "row",
    backgroundColor: cores.fundo,
    paddingVertical: 4,
    fontFamily: "Helvetica-Bold",
  },
  celPizza: { width: "20%", paddingRight: 4 },
  celCanal: { width: "20%", paddingRight: 4 },
  celTexto: { fontSize: 8 },
  bullet: { flexDirection: "row", marginBottom: 5 },
  bulletMarcador: { width: 12, fontFamily: "Helvetica-Bold" },
  bulletTexto: { flex: 1, fontSize: 9, lineHeight: 1.4 },
  rodape: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: cores.cinza,
    borderTop: `0.5pt solid ${cores.linha}`,
    paddingTop: 6,
  },
});

function corSinal(sinal: string) {
  if (sinal === "verde") return cores.menta;
  if (sinal === "amarelo") return cores.amarelo;
  if (sinal === "vermelho") return cores.vermelho;
  return cores.cinza;
}

function emojiSinal(sinal: string) {
  if (sinal === "verde") return "🟢";
  if (sinal === "amarelo") return "🟡";
  if (sinal === "vermelho") return "🔴";
  return "—";
}

function pct(v: number | null, casas = 1) {
  return v === null ? "—" : `${(v * 100).toFixed(casas)}%`;
}

function moeda(v: number | null) {
  return v === null ? "—" : `R$ ${v.toFixed(2).replace(".", ",")}`;
}

export default function RelatorioPDF({ dados, geradoEm }: { dados: DadosRelatorio; geradoEm: string }) {
  const { resumoFinanceiro: r } = dados;

  return (
    <Document title={`Relatório — ${dados.pizzariaNome}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.tituloRelatorio}>{dados.pizzariaNome}</Text>
          <Text style={styles.subtitulo}>
            {dados.cidade ? `${dados.cidade} · ` : ""}Relatório de CMV, margem e metas — gerado em {geradoEm}
          </Text>
        </View>

        {/* RESUMO FINANCEIRO */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Resumo financeiro</Text>
          <View style={styles.grid4}>
            <View style={styles.card}>
              <Text style={[styles.cardValor, { color: corSinal(r.cmvMedio !== null && r.cmvMedio > 0.38 ? "vermelho" : r.cmvMedio !== null && r.cmvMedio > 0.3 ? "amarelo" : "verde") }]}>
                {pct(r.cmvMedio)}
              </Text>
              <Text style={styles.cardLabel}>CMV médio (ponderado pelo faturamento)</Text>
            </View>
            <View style={styles.card}>
              <Text style={[styles.cardValor, { color: r.margemMediaProjetada !== null && r.margemMediaProjetada < 0 ? cores.vermelho : cores.menta }]}>
                {pct(r.margemMediaProjetada)}
              </Text>
              <Text style={styles.cardLabel}>Margem líquida projetada</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>{moeda(r.sobraMediaPorPizza)}</Text>
              <Text style={styles.cardLabel}>Sobra média por pizza vendida</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>{moeda(r.despesasFixasTotais)}</Text>
              <Text style={styles.cardLabel}>Despesas fixas / mês</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardValor}>
                {r.breakEven ? `${r.breakEven.unidadesMes} pizzas` : "—"}
              </Text>
              <Text style={styles.cardLabel}>
                Break-even / mês{r.breakEven ? ` (≈${r.breakEven.unidadesDia}/dia)` : ""}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={[styles.cardValor, { color: cores.menta }]}>
                {r.melhorCanal ? r.melhorCanal.nome : "—"}
              </Text>
              <Text style={styles.cardLabel}>
                Melhor canal{r.melhorCanal ? ` (${pct(r.melhorCanal.margemMediaPct)} margem média)` : ""}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={[styles.cardValor, { color: cores.vermelho }]}>
                {r.piorCanal ? r.piorCanal.nome : "—"}
              </Text>
              <Text style={styles.cardLabel}>
                Pior canal{r.piorCanal ? ` (${pct(r.piorCanal.margemMediaPct)} margem média)` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* METAS DE VENDA */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Metas de venda (considerando o mix atual de pizzas e canais)</Text>
          <View style={styles.cabecalhoTabela}>
            <Text style={{ width: "34%" }}>Meta</Text>
            <Text style={{ width: "22%" }}>Pizzas / mês</Text>
            <Text style={{ width: "22%" }}>Pizzas / dia</Text>
            <Text style={{ width: "22%" }}>Faturamento resultante</Text>
          </View>
          {dados.metas.map((m) => (
            <View key={m.label} style={styles.linhaTabela}>
              <Text style={{ width: "34%" }}>{m.label}</Text>
              <Text style={{ width: "22%", fontFamily: "Helvetica-Bold" }}>{m.unidadesMes}</Text>
              <Text style={{ width: "22%" }}>≈{m.unidadesDia}</Text>
              <Text style={{ width: "22%" }}>{moeda(m.faturamentoResultante)}</Text>
            </View>
          ))}
          {dados.metas.length === 0 && <Text style={styles.celTexto}>Sem dados suficientes pra calcular metas.</Text>}
        </View>

        {/* PLANO DE AÇÃO */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Plano de ação — prioridades</Text>
          {dados.planoDeAcao.map((acao, i) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletMarcador}>{i + 1}.</Text>
              <Text style={styles.bulletTexto}>{acao}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.rodape}>
          Precifique Sua Pizza · Gerado em {geradoEm} com os dados cadastrados no momento do download — atualize e
          baixe de novo sempre que mudar preços, custos ou taxas.
        </Text>
      </Page>

      {/* RENTABILIDADE PIZZA × CANAL */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tituloSecao}>Rentabilidade por pizza × canal</Text>
        <View style={styles.cabecalhoTabela}>
          <Text style={styles.celPizza}>Pizza</Text>
          <Text style={styles.celCanal}>Canal</Text>
          <Text style={{ width: "15%" }}>Preço atual</Text>
          <Text style={{ width: "15%" }}>Preço recom.</Text>
          <Text style={{ width: "15%" }}>CMV</Text>
          <Text style={{ width: "15%" }}>Sobra (R$)</Text>
        </View>
        {dados.rentabilidadePorPizza.map((pizza) =>
          pizza.celulas.map((cel, i) => (
            <View key={`${pizza.pizzaNome}-${cel.canalNome}`} style={styles.linhaTabela}>
              <Text style={styles.celPizza}>{i === 0 ? pizza.pizzaNome : ""}</Text>
              <Text style={styles.celCanal}>{cel.canalNome}</Text>
              <Text style={{ width: "15%" }}>{cel.temPreco ? moeda(cel.precoAtual) : "sem preço"}</Text>
              <Text style={{ width: "15%" }}>{cel.temPreco ? moeda(cel.precoRecomendado) : "—"}</Text>
              <Text style={{ width: "15%", color: corSinal(cel.sinal) }}>
                {cel.temPreco ? `${emojiSinal(cel.sinal)} ${pct(cel.cmv)}` : "—"}
              </Text>
              <Text style={{ width: "15%" }}>{cel.temPreco ? moeda(cel.sobra) : "—"}</Text>
            </View>
          ))
        )}
        <Text style={styles.rodape}>
          🟢 CMV até 30% (saudável) · 🟡 30–38% (atenção) · 🔴 acima de 38% (crítico). Preço recomendado calculado
          para CMV-alvo de 30%, respeitando o teto de mercado quando definido.
        </Text>
      </Page>

      {/* RANKING */}
      <Page size="A4" style={styles.page}>
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Piores combinações pizza × canal</Text>
          <View style={styles.cabecalhoTabela}>
            <Text style={styles.celPizza}>Pizza</Text>
            <Text style={styles.celCanal}>Canal</Text>
            <Text style={{ width: "20%" }}>CMV</Text>
            <Text style={{ width: "20%" }}>Sobra (R$)</Text>
          </View>
          {dados.ranking.pioresCombos.map((c, i) => (
            <View key={i} style={styles.linhaTabela}>
              <Text style={styles.celPizza}>{c.pizzaNome}</Text>
              <Text style={styles.celCanal}>{c.canalNome}</Text>
              <Text style={{ width: "20%", color: corSinal(c.sinal) }}>
                {emojiSinal(c.sinal)} {pct(c.cmv)}
              </Text>
              <Text style={{ width: "20%" }}>{moeda(c.sobra)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Combinações mais rentáveis</Text>
          <View style={styles.cabecalhoTabela}>
            <Text style={styles.celPizza}>Pizza</Text>
            <Text style={styles.celCanal}>Canal</Text>
            <Text style={{ width: "20%" }}>CMV</Text>
            <Text style={{ width: "20%" }}>Sobra (R$)</Text>
          </View>
          {dados.ranking.melhoresCombos.map((c, i) => (
            <View key={i} style={styles.linhaTabela}>
              <Text style={styles.celPizza}>{c.pizzaNome}</Text>
              <Text style={styles.celCanal}>{c.canalNome}</Text>
              <Text style={{ width: "20%", color: corSinal(c.sinal) }}>
                {emojiSinal(c.sinal)} {pct(c.cmv)}
              </Text>
              <Text style={{ width: "20%" }}>{moeda(c.sobra)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Pizzas com CMV excessivo (média acima de 38%)</Text>
          {dados.ranking.cmvExcessivo.length === 0 ? (
            <Text style={styles.celTexto}>Nenhuma pizza com CMV médio crítico. 🎉</Text>
          ) : (
            dados.ranking.cmvExcessivo.map((p, i) => (
              <View key={i} style={styles.linhaTabela}>
                <Text style={{ width: "60%" }}>{p.pizzaNome}</Text>
                <Text style={{ width: "20%", color: cores.vermelho }}>{pct(p.cmvMedio)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Onde há maior potencial de melhorar margem</Text>
          {dados.ranking.maiorPotencial.length === 0 ? (
            <Text style={styles.celTexto}>Sem oportunidades óbvias de ajuste de preço no momento.</Text>
          ) : (
            dados.ranking.maiorPotencial.map((c, i) => (
              <View key={i} style={styles.linhaTabela}>
                <Text style={styles.celPizza}>{c.pizzaNome}</Text>
                <Text style={styles.celCanal}>{c.canalNome}</Text>
                <Text style={{ width: "20%" }}>
                  {moeda(c.precoAtual)} → {moeda(c.precoRecomendado)}
                </Text>
                <Text style={{ width: "20%", color: cores.menta }}>+{moeda(c.ganhoPotencial)}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.rodape}>Precifique Sua Pizza · Gerado em {geradoEm}</Text>
      </Page>
    </Document>
  );
}
