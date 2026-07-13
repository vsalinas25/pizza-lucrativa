-- ============================================================
-- Precifique Sua Pizza — schema inicial
-- Roda no SQL Editor do Supabase ou via `supabase db push`
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- purchases (compra única, R$297, acesso vitalício) ----------
-- user_id é nullable de propósito: a sessão do Stripe é criada ANTES da
-- conta existir (checkout-first, conta depois). O webhook grava
-- checkout_email a partir do Stripe; a rota de criação de conta em
-- /checkout/processando faz o UPDATE de user_id assim que a conta é criada.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  checkout_email text,
  stripe_session_id text unique not null,
  status text not null check (status in ('pending', 'completed', 'refunded')) default 'pending',
  tipo text not null default 'compra_unica',
  valor numeric(10,2) not null default 297.00,
  metodo_pagamento text, -- 'card' | 'pix'
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- renovacoes (R$97/ano, opcional, NUNCA bloqueia o core) ----------
create table if not exists public.renovacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_session_id text unique not null,
  status text not null check (status in ('pending', 'completed')) default 'pending',
  valor numeric(10,2) not null default 97.00,
  metodo_pagamento text,
  periodo_inicio timestamptz,
  periodo_fim timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- pizzarias ----------
create table if not exists public.pizzarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  cidade text,
  despesas_fixas_mensais numeric(12,2) not null default 0,
  regime_tributario text,
  aliquota_imposto numeric(5,2) not null default 0, -- percentual, ex: 6.00
  taxa_cartao numeric(5,2) not null default 0,
  volume_mensal_pizzas integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- canais_venda ----------
create table if not exists public.canais_venda (
  id uuid primary key default gen_random_uuid(),
  pizzaria_id uuid not null references public.pizzarias(id) on delete cascade,
  nome text not null, -- 'site' | 'ifood' | 'keeta' | '99food' | 'personalizado'
  comissao_percentual numeric(5,2) not null default 0,
  taxa_transacao_percentual numeric(5,2) not null default 0,
  taxa_marketing_percentual numeric(5,2) not null default 0,
  custo_fixo_mensal numeric(12,2) not null default 0,
  percentual_participacao_mix numeric(5,2) not null default 0,
  atualizado_via_renovacao boolean not null default false, -- true se veio de default liberado por renovação
  created_at timestamptz not null default now()
);

-- ---------- pizzas ----------
create table if not exists public.pizzas (
  id uuid primary key default gen_random_uuid(),
  pizzaria_id uuid not null references public.pizzarias(id) on delete cascade,
  nome text not null,
  categoria text not null check (categoria in ('tradicional', 'especial', 'doce')) default 'tradicional',
  custo_ficha_tecnica numeric(10,2) not null default 0,
  teto_preco_mercado numeric(10,2),
  created_at timestamptz not null default now()
);

-- ---------- precos_por_canal ----------
create table if not exists public.precos_por_canal (
  id uuid primary key default gen_random_uuid(),
  pizza_id uuid not null references public.pizzas(id) on delete cascade,
  canal_id uuid not null references public.canais_venda(id) on delete cascade,
  preco_atual numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (pizza_id, canal_id)
);

-- ============================================================
-- Row Level Security — isolamento total por user_id
-- ============================================================

alter table public.purchases enable row level security;
alter table public.renovacoes enable row level security;
alter table public.pizzarias enable row level security;
alter table public.canais_venda enable row level security;
alter table public.pizzas enable row level security;
alter table public.precos_por_canal enable row level security;

-- purchases: usuário só vê/gerencia as próprias
create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id);
create policy "purchases_insert_own" on public.purchases for insert with check (auth.uid() = user_id);
-- updates (status) são feitos pelo webhook via service role, que ignora RLS

-- renovacoes
create policy "renovacoes_select_own" on public.renovacoes for select using (auth.uid() = user_id);
create policy "renovacoes_insert_own" on public.renovacoes for insert with check (auth.uid() = user_id);

-- pizzarias
create policy "pizzarias_all_own" on public.pizzarias for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- canais_venda (isolado via join com pizzarias)
create policy "canais_select_own" on public.canais_venda for select
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "canais_insert_own" on public.canais_venda for insert
  with check (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "canais_update_own" on public.canais_venda for update
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "canais_delete_own" on public.canais_venda for delete
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));

-- pizzas
create policy "pizzas_select_own" on public.pizzas for select
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "pizzas_insert_own" on public.pizzas for insert
  with check (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "pizzas_update_own" on public.pizzas for update
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));
create policy "pizzas_delete_own" on public.pizzas for delete
  using (exists (select 1 from public.pizzarias p where p.id = pizzaria_id and p.user_id = auth.uid()));

-- precos_por_canal (isolado via join pizza -> pizzaria)
create policy "precos_select_own" on public.precos_por_canal for select
  using (exists (
    select 1 from public.pizzas pz
    join public.pizzarias p on p.id = pz.pizzaria_id
    where pz.id = pizza_id and p.user_id = auth.uid()
  ));
create policy "precos_insert_own" on public.precos_por_canal for insert
  with check (exists (
    select 1 from public.pizzas pz
    join public.pizzarias p on p.id = pz.pizzaria_id
    where pz.id = pizza_id and p.user_id = auth.uid()
  ));
create policy "precos_update_own" on public.precos_por_canal for update
  using (exists (
    select 1 from public.pizzas pz
    join public.pizzarias p on p.id = pz.pizzaria_id
    where pz.id = pizza_id and p.user_id = auth.uid()
  ));
create policy "precos_delete_own" on public.precos_por_canal for delete
  using (exists (
    select 1 from public.pizzas pz
    join public.pizzarias p on p.id = pz.pizzaria_id
    where pz.id = pizza_id and p.user_id = auth.uid()
  ));

-- ============================================================
-- Índices úteis
-- ============================================================
create index if not exists idx_pizzarias_user on public.pizzarias(user_id);
create index if not exists idx_canais_pizzaria on public.canais_venda(pizzaria_id);
create index if not exists idx_pizzas_pizzaria on public.pizzas(pizzaria_id);
create index if not exists idx_precos_pizza on public.precos_por_canal(pizza_id);
create index if not exists idx_precos_canal on public.precos_por_canal(canal_id);
create index if not exists idx_purchases_user on public.purchases(user_id);
create index if not exists idx_renovacoes_user on public.renovacoes(user_id);

-- ============================================================
-- Função auxiliar: usuário tem compra completa? (usada no middleware via RPC opcional)
-- ============================================================
create or replace function public.has_active_purchase(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.purchases
    where user_id = uid and status = 'completed'
  );
$$;

create or replace function public.has_active_renovacao(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.renovacoes
    where user_id = uid and status = 'completed' and periodo_fim > now()
  );
$$;
