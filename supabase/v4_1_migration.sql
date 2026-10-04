-- TradeJournal v4.1 — screenshots + weekly reviews
-- Run once in Supabase > SQL Editor before using screenshot uploads and Weekreview storage.

create table if not exists public.trade_screenshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  file_size bigint not null check (file_size > 0 and file_size <= 5242880),
  created_at timestamptz not null default now()
);

create index if not exists trade_screenshots_trade_id_idx on public.trade_screenshots(trade_id);
create index if not exists trade_screenshots_user_id_idx on public.trade_screenshots(user_id);

alter table public.trade_screenshots enable row level security;

drop policy if exists "Users can view own trade screenshots" on public.trade_screenshots;
create policy "Users can view own trade screenshots" on public.trade_screenshots
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own trade screenshots" on public.trade_screenshots;
create policy "Users can insert own trade screenshots" on public.trade_screenshots
  for insert to authenticated with check (
    (select auth.uid()) = user_id and exists (
      select 1 from public.trades t where t.id = trade_id and t.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can delete own trade screenshots" on public.trade_screenshots;
create policy "Users can delete own trade screenshots" on public.trade_screenshots
  for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_reviews_user_week_idx on public.weekly_reviews(user_id, week_start desc);
alter table public.weekly_reviews enable row level security;

drop policy if exists "Users can view own weekly reviews" on public.weekly_reviews;
create policy "Users can view own weekly reviews" on public.weekly_reviews
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own weekly reviews" on public.weekly_reviews;
create policy "Users can insert own weekly reviews" on public.weekly_reviews
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own weekly reviews" on public.weekly_reviews;
create policy "Users can update own weekly reviews" on public.weekly_reviews
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own weekly reviews" on public.weekly_reviews;
create policy "Users can delete own weekly reviews" on public.weekly_reviews
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_weekly_reviews_updated_at on public.weekly_reviews;
create trigger set_weekly_reviews_updated_at before update on public.weekly_reviews
for each row execute function public.set_updated_at();

-- Private Storage bucket for trade screenshots.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trade-screenshots', 'trade-screenshots', false, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view own screenshot objects" on storage.objects;
create policy "Users can view own screenshot objects" on storage.objects
  for select to authenticated using (
    bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload own screenshot objects" on storage.objects;
create policy "Users can upload own screenshot objects" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete own screenshot objects" on storage.objects;
create policy "Users can delete own screenshot objects" on storage.objects
  for delete to authenticated using (
    bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
