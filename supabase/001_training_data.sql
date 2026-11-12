-- Run once in this project's Supabase SQL Editor. Safe to rerun.
begin;

create table if not exists public.training_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint training_data_shape check (
    jsonb_typeof(data) = 'object'
    and data ?& array['profile', 'history', 'mastered', 'configured']
    and jsonb_typeof(data->'profile') = 'object'
    and jsonb_typeof(data->'history') = 'array'
    and jsonb_typeof(data->'mastered') = 'array'
    and jsonb_typeof(data->'configured') = 'boolean'
    and octet_length(data::text) <= 5000000
  )
);
alter table public.training_data enable row level security;

drop policy if exists "Read own training data" on public.training_data;
create policy "Read own training data" on public.training_data
  for select to authenticated using ((select auth.uid()) = user_id);

-- Writes only go through the revision-checked function below.
revoke all on public.training_data from public, anon, authenticated;
grant select on public.training_data to authenticated;

create or replace function public.save_training_data(expected_revision bigint, payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  next_revision bigint;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if expected_revision is null or expected_revision < 0 or payload is null then
    raise exception 'Invalid training data' using errcode = '22023';
  end if;
  if expected_revision = 0 then
    insert into public.training_data (user_id, data)
      values (caller, payload)
      on conflict (user_id) do nothing
      returning revision into next_revision;
  else
    update public.training_data
      set data = payload, revision = revision + 1, updated_at = now()
      where user_id = caller and revision = expected_revision
      returning revision into next_revision;
  end if;
  if next_revision is null then
    raise exception 'Training data changed on another device' using errcode = '40001';
  end if;
  return next_revision;
end;
$$;

revoke all on function public.save_training_data(bigint, jsonb) from public, anon;
grant execute on function public.save_training_data(bigint, jsonb) to authenticated;
commit;
