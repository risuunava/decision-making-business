-- DecideFirst Phase 1: schema + RLS
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent).

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_type text not null
    check (business_type in ('f&b', 'retail', 'jasa', 'lainnya')),
  currency text not null default 'IDR',
  created_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  scenario_type text not null
    check (scenario_type in ('pricing', 'discount', 'staffing', 'inventory')),
  input_params jsonb not null,
  assumption_source text not null default 'manual'
    check (assumption_source in ('manual', 'benchmark', 'estimated')),
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.decision_log (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  executed_at timestamptz,
  actual_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists simulations_business_id_idx
  on public.simulations(business_id);

create index if not exists decision_log_simulation_id_idx
  on public.decision_log(simulation_id);

-- ============ RLS ============

alter table public.businesses enable row level security;
alter table public.simulations enable row level security;
alter table public.decision_log enable row level security;

-- businesses: akses langsung oleh pemilik
drop policy if exists "businesses_select_own" on public.businesses;
create policy "businesses_select_own" on public.businesses
  for select using (owner_id = auth.uid());

drop policy if exists "businesses_insert_own" on public.businesses;
create policy "businesses_insert_own" on public.businesses
  for insert with check (owner_id = auth.uid());

drop policy if exists "businesses_update_own" on public.businesses;
create policy "businesses_update_own" on public.businesses
  for update using (owner_id = auth.uid());

drop policy if exists "businesses_delete_own" on public.businesses;
create policy "businesses_delete_own" on public.businesses
  for delete using (owner_id = auth.uid());

-- simulations: hanya lewat kepemilikan business terkait
drop policy if exists "simulations_select_own" on public.simulations;
create policy "simulations_select_own" on public.simulations
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = simulations.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "simulations_insert_own" on public.simulations;
create policy "simulations_insert_own" on public.simulations
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = simulations.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "simulations_update_own" on public.simulations;
create policy "simulations_update_own" on public.simulations
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = simulations.business_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "simulations_delete_own" on public.simulations;
create policy "simulations_delete_own" on public.simulations
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = simulations.business_id and b.owner_id = auth.uid()
    )
  );

-- decision_log: hanya lewat simulations milik user
drop policy if exists "decision_log_select_own" on public.decision_log;
create policy "decision_log_select_own" on public.decision_log
  for select using (
    exists (
      select 1 from public.simulations s
      join public.businesses b on b.id = s.business_id
      where s.id = decision_log.simulation_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_log_insert_own" on public.decision_log;
create policy "decision_log_insert_own" on public.decision_log
  for insert with check (
    exists (
      select 1 from public.simulations s
      join public.businesses b on b.id = s.business_id
      where s.id = decision_log.simulation_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_log_update_own" on public.decision_log;
create policy "decision_log_update_own" on public.decision_log
  for update using (
    exists (
      select 1 from public.simulations s
      join public.businesses b on b.id = s.business_id
      where s.id = decision_log.simulation_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_log_delete_own" on public.decision_log;
create policy "decision_log_delete_own" on public.decision_log
  for delete using (
    exists (
      select 1 from public.simulations s
      join public.businesses b on b.id = s.business_id
      where s.id = decision_log.simulation_id and b.owner_id = auth.uid()
    )
  );
