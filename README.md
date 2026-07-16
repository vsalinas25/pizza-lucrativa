# Precifique Sua Pizza

Dashboard de CMV e precificação por canal (site próprio, iFood, Keeta, 99Food)
para donos de pizzaria. Compra única (R$297, acesso vitalício) + renovação
anual opcional (R$97) para manter taxas de plataforma atualizadas.

Stack: Next.js 14 (App Router) + TypeScript · Tailwind CSS · Supabase
(Postgres + Auth + RLS) · Stripe Checkout (card + PIX) · Vercel.

## Status

Em produção em `https://pizza-lucrativa-delta.vercel.app`, rodando com
Supabase real e **Stripe em modo live** — pagamentos no site são cobranças
reais. Repositório: `github.com/vsalinas25/pizza-lucrativa`.

Pendências antes de divulgar o link amplamente:

- **PIX**: desabilitado (`STRIPE_PIX_HABILITADO=false`) até a conta Stripe
  liberar o método para o negócio — ver seção 4.
- **VSL**: ainda não gravado, a landing mostra um placeholder no lugar do
  vídeo.

---

## 1. Pré-requisitos

- Node.js 20+
- Conta Supabase (gratuita serve para começar)
- Conta Stripe (ativada para o Brasil; PIX exige verificação adicional da
  conta, ver seção 4)
- Conta Vercel + repositório no GitHub

## 2. Clonar e instalar

```bash
git clone https://github.com/vsalinas25/pizza-lucrativa.git
cd pizza-lucrativa
npm install
```

## 3. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/migrations/0001_init.sql`
   inteiro (cria as tabelas, RLS e funções auxiliares).
3. Em **Project Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key (aba "Legacy anon, service_role API keys") →
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (mesma aba) → `SUPABASE_SERVICE_ROLE_KEY` (nunca
     commitar, nunca usar no client). **Cole com cuidado** — colar via
     algumas interfaces pode inserir um caractere de tab/quebra de linha
     junto com o valor, o que quebra toda chamada autenticada com essa
     chave de forma silenciosa em `/api/checkout` e com erro visível em
     `/api/checkout/vincular-compra` (`TypeError: Headers.set: "Bearer
     \t\n..." is an invalid header value`). Se isso acontecer, apague a
     variável inteira e recrie do zero em vez de editar o valor existente.
4. Em **Authentication > Providers > Email**, desabilite **"Confirm
   email"**. Sem isso, o cadastro pós-compra não gera uma sessão
   automática — o cliente paga, cria a conta, e cai de volta na tela de
   login em vez de entrar direto no onboarding. É exatamente a fricção
   pós-compra que o produto existe para eliminar.

## 4. Configurar o Stripe

1. Em **Developers > API keys**, copie a `Secret key` → `STRIPE_SECRET_KEY`.
   Use a chave de **test mode** para desenvolvimento local (nunca a live).
2. Habilite PIX: **Settings > Payment methods** → ative Pix. Isso pode não
   aparecer disponível até a conta completar verificação de negócio
   brasileiro — enquanto isso, deixe `STRIPE_PIX_HABILITADO=false` no
   ambiente (ver `lib/stripe.ts` → `paymentMethodTypes()`). Tentar criar
   uma sessão de Checkout com `payment_method_types` incluindo `pix` numa
   conta sem Pix habilitado falha com `payment method type provided: pix
   is invalid`.
3. Crie o endpoint de webhook: **Developers > Webhooks > Add destination**
   - URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/stripe`
   - Eventos a escutar:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `charge.refunded`
   - Copie o **Signing secret** → `STRIPE_WEBHOOK_SECRET`
   - **Test mode e live mode têm webhooks separados** — crie um endpoint em
     cada ambiente (o toggle "Test mode" no Stripe Dashboard determina qual
     webhook list você está vendo/editando), cada um com seu próprio
     `whsec_...`.
4. Para testar localmente com eventos reais de webhook, use a Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Isso te dá um `whsec_...` temporário para desenvolvimento. Sem isso,
   webhooks simplesmente não chegam em `localhost` — mas o checkout com
   cartão ainda funciona de ponta a ponta sem o webhook, porque
   `/api/checkout/vincular-compra` também confirma o pagamento diretamente
   via polling na API do Stripe (ver `lib/pagamentos.ts`).

## 5. Variáveis de ambiente

```bash
cp .env.example .env.local
```
Preencha todos os valores coletados nos passos 3 e 4.

**Nunca coloque uma chave `sk_live_...` no `.env.local`.** O ambiente local
é para desenvolvimento — use sempre a chave de test mode aqui, mesmo que a
Vercel (produção) já esteja com a chave live.

## 6. Rodar localmente

```bash
npm run dev
```
Abra `http://localhost:3000`.

## 7. Deploy na Vercel

1. Importe o repositório GitHub na Vercel.
2. Em **Settings > Environment Variables**, adicione todas as variáveis do
   `.env.local` (exceto `NEXT_PUBLIC_SITE_URL`, que deve ser a URL real de
   produção — algo como `https://SEU-PROJETO.vercel.app`, sem barra no
   final).
3. Deploy. Push na branch principal = deploy automático a partir daqui.
   **Variáveis de ambiente novas ou editadas só entram em vigor no próximo
   deploy** — salvar sozinho na Vercel não é suficiente, é preciso
   redeployar (Deployments → "..." no deployment mais recente → Redeploy).
4. Volte ao Stripe e crie/atualize o endpoint de webhook para o domínio de
   produção (seção 4, passo 3).

### Indo para produção com cobranças reais (Stripe live mode)

1. Rotacione a chave de test mode que estiver exposta em qualquer lugar
   (histórico de chat, print de tela) antes de configurar a live —
   Developers > API keys > "..." > Rotate key.
2. Troque `STRIPE_SECRET_KEY` na Vercel pela chave `sk_live_...`.
3. Crie um **novo webhook em live mode** (não reaproveita o de test mode)
   e troque `STRIPE_WEBHOOK_SECRET` pelo `whsec_...` gerado nele.
4. Redeploy.
5. Verifique com uma chamada direta (sem passar por Checkout) que tanto a
   chave do Stripe quanto a `SUPABASE_SERVICE_ROLE_KEY` estão corretas
   antes de divulgar o link:
   ```bash
   curl -X POST https://SEU-DOMINIO.vercel.app/api/checkout/vincular-compra \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"cs_test_qualquer_coisa","userId":"00000000-0000-0000-0000-000000000000"}'
   ```
   Um 500 com corpo vazio (sessão não encontrada) é esperado e ok. Um 500
   com `TypeError: Headers.set: "Bearer \t\n..."` no corpo indica que a
   `SUPABASE_SERVICE_ROLE_KEY` foi colada com caracteres extras — vá até a
   seção 3 acima.
6. Faça uma compra real de teste com seu próprio cartão antes de divulgar
   o link — reembolsável em até 7 dias pela política em `/termos`.

## 8. O que falta antes de vender em escala (não é código, é conteúdo)

- Gravar e hospedar o VSL (YouTube unlisted / Vimeo / Mux) e preencher
  `NEXT_PUBLIC_VSL_EMBED_URL` / `NEXT_PUBLIC_VSL_THUMBNAIL_URL`.
- Habilitar Pix na conta Stripe (seção 4) e então virar
  `STRIPE_PIX_HABILITADO=true`.
- Depoimentos em vídeo/print de beta testers reais (a landing está
  estruturada para isso, mas hoje só tem o caso Vitto & Giulio).

## Estrutura do projeto

```
app/
  page.tsx                    → landing page de vendas
  termos/                      → termos de uso, reembolso e privacidade
  login/                       → login + recuperação de senha
  onboarding/                  → cadastro inicial (pizzaria, canais, CSV)
  dashboard/                   → dashboard principal (protegido)
  configuracoes/                → editar pizzaria/canais, status de compra (protegido)
  checkout/
    processando/                → polling PIX pós-checkout
    criar-conta/                 → criação de conta pós-pagamento
  api/
    checkout/                    → cria sessão Stripe (compra), vincula conta pós-cadastro
    renovacao/                   → cria sessão Stripe (renovação)
    webhooks/stripe/             → processa ambos os fluxos
components/
  landing/                     → componentes da página de vendas
  dashboard/                   → componentes do dashboard
  configuracoes/                → componentes da página de configurações
lib/
  calc.ts                      → TODA a lógica de CMV/precificação
  pagamentos.ts                 → confirmação de pagamento, compartilhada entre webhook e vincular-compra
  stripe.ts, supabase/, acesso.ts
supabase/migrations/           → schema SQL completo
types/                         → tipos + defaults de taxas de plataforma (levantados 2026-07-13)
```

## Lógica de cálculo (lib/calc.ts)

- `CMV% = custo_ficha_tecnica / preco_no_canal`
- `Preço mínimo = custo_ficha_tecnica / CMV_alvo`
- `Margem de contribuição = preço - custo - (preço × taxas_do_canal)`
- `Margem líquida = (receita - CMV_total - custos_variáveis - despesas_fixas) / receita`,
  onde despesas fixas inclui tanto `pizzarias.despesas_fixas_mensais`
  quanto a soma de `canais_venda.custo_fixo_mensal` de todos os canais
  ativos (ex: mensalidade fixa do iFood).

Margem de contribuição (por pizza) e margem líquida (do negócio) nunca são
o mesmo número — a UI rotula os dois separadamente, de propósito.
