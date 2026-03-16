create extension if not exists pgcrypto;

create table if not exists public.waitlist_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'lp_day3',
  created_at timestamptz not null default now()
);

alter table public.waitlist_subscribers enable row level security;
