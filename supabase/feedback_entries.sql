create extension if not exists pgcrypto;

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  rating integer not null check (rating between 1 and 5),
  message text not null,
  email text,
  page_path text not null default '/shoot',
  spec_id text not null,
  background_preset_id text not null,
  background_label text not null,
  face_detected boolean not null default true,
  used_fallbacks text[] not null default '{}'::text[],
  source_kind text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback_entries enable row level security;
