# Precifique Sua Pizza

Dashboard de CMV e precificação por canal (site próprio, iFood, Keeta, 99Food)
para donos de pizzaria. Compra única (R$297, acesso vitalício) + renovação
anual opcional (R$97) para manter taxas de plataforma atualizadas.

Stack: Next.js 14 (App Router) + TypeScript · Tailwind CSS · Supabase
(Postgres + Auth + RLS) · Stripe Checkout (card + PIX) · Vercel.

---

## 1. Pré-requisitos

- Node.js 20+
- Conta Supabase (gratuita serve para começar)
- Conta Stripe (ativada para o Brasil, com PIX habilitado)
- Conta Vercel + repositório no GitHub

## 2. Clonar e instalar

```bash
git clone <seu-repo>
cd precifique-pizza
npm install
```

## 3. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/migrations/0001_init.sql`
   inteiro (cria as tabelas, RLS e funções auxiliares).
3. Em **Project Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (nunca commitar, nunca
     usar no client)
4. Em **Authentication > Providers**, confirme que Email está habilitado.
   Recomendado desabilitar confirmação de e-mail obrigatória no início
   (Authentication > Settings) para não adicionar fricção ao fluxo de
   pós-compra — o usuário já pagou, o objetivo é ativação imediata.

## 4. Configurar o Stripe

1. Em **Developers > API keys**, copie a `Secret key` → `STRIPE_SECRET_KEY`.
2. Habilite PIX: **Settings > Payment methods** → ative PIX (disponível para
   contas Stripe Brasil).
3. Crie o endpoint de webhook: **Developers > Webhooks > Add endpoint**
   - URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/stripe`
   - Eventos a escutar:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `charge.refunded`
   - Copie o **Signing secret** → `STRIPE_WEBHOOK_SECRET`
4. Para testar localmente, use a Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Isso te dá um `whsec_...` temporário para desenvolvimento.

## 5. Variáveis de ambiente

```bash
cp .env.example .env.local
```
Preencha todos os valores coletados nos passos 3 e 4.

## 6. Rodar localmente

```bash
npm run dev
```
Abra `http://localhost:3000`.

## 7. Deploy na Vercel

1. Importe o repositório GitHub na Vercel.
2. Em **Settings > Environment Variables**, adicione todas as variáveis do
   `.env.local` (exceto `NEXT_PUBLIC_SITE_URL`, que deve ser a URL real de
   produção).
3. Deploy. Push na branch principal = deploy automático a partir daqui.
4. Volte ao Stripe e atualize a URL do webhook para o domínio de produção.

## 8. O que falta antes de vender (não é código, é conteúdo)

- Gravar e hospedar o VSL (YouTube unlisted / Vimeo / Mux) e preencher
  `NEXT_PUBLIC_VSL_EMBED_URL` / `NEXT_PUBLIC_VSL_THUMBNAIL_URL`.
- Validar as taxas-padrão de plataforma em `types/index.ts` →
  `DEFAULT_TAXAS_PLATAFORMA` — estão como placeholders de exemplo.
- Depoimentos em vídeo/print de beta testers reais (a landing está
  estruturada para isso, mas hoje só tem o caso Vitto & Giulio).

## Estrutura do projeto

```
app/
  page.tsx                    → landing page de vendas
  login/                       → login + recuperação de senha
  onboarding/                  → cadastro inicial (pizzaria, canais, CSV)
  dashboard/                   → dashboard principal (protegido)
  checkout/
    processando/                → polling PIX pós-checkout
    criar-conta/                 → criação de conta pós-pagamento
  api/
    checkout/                    → cria sessão Stripe (compra)
    renovacao/                   → cria sessão Stripe (renovação)
    webhooks/stripe/             → processa ambos os fluxos
components/
  landing/                     → componentes da página de vendas
  dashboard/                   → componentes do dashboard
lib/
  calc.ts                      → TODA a lógica de CMV/precificação
  stripe.ts, supabase/, acesso.ts
supabase/migrations/           → schema SQL completo
types/                         → tipos + defaults de taxas de plataforma
```

## Lógica de cálculo (lib/calc.ts)

- `CMV% = custo_ficha_tecnica / preco_no_canal`
- `Preço mínimo = custo_ficha_tecnica / CMV_alvo`
- `Margem de contribuição = preço - custo - (preço × taxas_do_canal)`
- `Margem líquida = (receita - CMV_total - custos_variáveis - despesas_fixas) / receita`

Margem de contribuição (por pizza) e margem líquida (do negócio) nunca são
o mesmo número — a UI rotula os dois separadamente, de propósito.
