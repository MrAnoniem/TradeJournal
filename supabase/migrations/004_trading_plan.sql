-- TradeJournal v4 — Trading Plan
-- Run this once in Supabase SQL Editor before using the Trading Plan page.

create table if not exists public.trading_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mijn Trading Plan',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trading_plan_rules (
  id uuid primary key default gen_random_uuid(),
  trading_plan_id uuid not null references public.trading_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bias','poi','entry','exit')),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trading_plans_user_id_idx on public.trading_plans(user_id);
create index if not exists trading_plan_rules_plan_id_idx on public.trading_plan_rules(trading_plan_id);
create index if not exists trading_plan_rules_user_id_idx on public.trading_plan_rules(user_id);
create unique index if not exists one_active_trading_plan_per_user
  on public.trading_plans(user_id) where is_active = true;

alter table public.trading_plans enable row level security;
alter table public.trading_plan_rules enable row level security;

create policy "Users can view own trading plans" on public.trading_plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own trading plans" on public.trading_plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own trading plans" on public.trading_plans
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own trading plans" on public.trading_plans
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view own trading plan rules" on public.trading_plan_rules
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own trading plan rules" on public.trading_plan_rules
  for insert to authenticated with check (
    (select auth.uid()) = user_id and exists (
      select 1 from public.trading_plans p where p.id = trading_plan_id and p.user_id = (select auth.uid())
    )
  );
create policy "Users can update own trading plan rules" on public.trading_plan_rules
  for update to authenticated using ((select auth.uid()) = user_id) with check (
    (select auth.uid()) = user_id and exists (
      select 1 from public.trading_plans p where p.id = trading_plan_id and p.user_id = (select auth.uid())
    )
  );
create policy "Users can delete own trading plan rules" on public.trading_plan_rules
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_trading_plans_updated_at on public.trading_plans;
create trigger set_trading_plans_updated_at before update on public.trading_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_trading_plan_rules_updated_at on public.trading_plan_rules;
create trigger set_trading_plan_rules_updated_at before update on public.trading_plan_rules
for each row execute function public.set_updated_at();
