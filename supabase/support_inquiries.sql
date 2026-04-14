create extension if not exists pgcrypto;

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  status text not null default 'open',
  email text not null,
  message text not null,
  page_path text not null default '/support',
  stripe_session_id text,
  stripe_payment_intent_id text,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.support_inquiries enable row level security;

create index if not exists support_inquiries_status_created_at
  on public.support_inquiries (status, created_at desc);

create index if not exists support_inquiries_category_created_at
  on public.support_inquiries (category, created_at desc);
