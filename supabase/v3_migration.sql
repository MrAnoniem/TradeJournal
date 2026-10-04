-- Trade Journal v3: run once in Supabase > SQL Editor.
alter table public.trades
add column if not exists commission numeric not null default 0;

-- Existing RLS policies remain unchanged.
