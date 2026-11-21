-- The Morning Anchor freebie: where sign-ups are stored.
-- Run once in Jacqui's own Supabase project. Safe to run again (it creates nothing twice).

create table if not exists public.jacqui_leads (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  email       text not null,
  phone       text,
  source      text default 'The Morning Anchor - lead magnet',
  notified    boolean default false,
  created_at  timestamptz default now()
);

create index if not exists jacqui_leads_email_idx on public.jacqui_leads (lower(email));

-- Locked: row level security is on and there are no policies, so nobody can read or write
-- this table from the public internet. Only the jacqui-lead function (which uses the
-- project's own secret key on the server) can add rows.
alter table public.jacqui_leads enable row level security;
