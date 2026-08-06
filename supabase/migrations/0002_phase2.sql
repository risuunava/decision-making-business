-- DecideFirst Phase 2: transactions + pricing_history schema + RLS
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent).

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  date date not null,
  item_name text not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  cost_per_unit numeric not null check (cost_per_unit >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_name text not null,
  price numeric not null check (price > 0),
  effective_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_business_id_idx
  on public.transactions(business_id);

create index if not exists transactions_business_date_idx
  on public.transactions(business_id, date desc);

create index if not exists pricing_history_business_id_idx
  on public.pricing_history(business_id);

-- ============ RLS ============

alter table public.transactions enable row level security;
alter table public.pricing_history enable row level security;

-- transactions: hanya lewat kepemilikan business terkait
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = transactions.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = transactions.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = transactions.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = transactions.business_id and b.owner_id = auth.uid()
    )
  );

-- pricing_history: hanya lewat kepemilikan business terkait
drop policy if exists "pricing_history_select_own" on public.pricing_history;
create policy "pricing_history_select_own" on public.pricing_history
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = pricing_history.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "pricing_history_insert_own" on public.pricing_history;
create policy "pricing_history_insert_own" on public.pricing_history
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = pricing_history.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "pricing_history_update_own" on public.pricing_history;
create policy "pricing_history_update_own" on public.pricing_history
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = pricing_history.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "pricing_history_delete_own" on public.pricing_history;
create policy "pricing_history_delete_own" on public.pricing_history
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = pricing_history.business_id and b.owner_id = auth.uid()
    )
  );
