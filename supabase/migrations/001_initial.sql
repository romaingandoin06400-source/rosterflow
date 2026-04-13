-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Contacts table
create table public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  photo_url   text,
  stage       text not null default 'matched'
                check (stage in ('matched', 'talking', 'irl', 'dating', 'archived')),
  source_app  text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user queries
create index contacts_user_id_idx on public.contacts(user_id);

-- Row-level security
alter table public.contacts enable row level security;

create policy "Users can manage their own contacts"
  on public.contacts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Storage bucket for contact photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict do nothing;

create policy "Anyone can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos');

create policy "Photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');
